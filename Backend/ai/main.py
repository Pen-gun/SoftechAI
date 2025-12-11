from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from typing import Optional
from ocr_util import extract_text_from_file, extract_text_from_excel, answer_question_on_excel
import os

# Lazy-load heavy models to avoid repeated initialization
doc_qa_pipeline = None
summarizer_pipeline = None

def get_doc_qa_pipeline():
    global doc_qa_pipeline
    if doc_qa_pipeline is None:
        doc_qa_pipeline = pipeline(
            "document-question-answering",
            model="naver-clova-ix/donut-base-finetuned-docvqa"
        )
    return doc_qa_pipeline

def get_summarizer_pipeline():
    global summarizer_pipeline
    if summarizer_pipeline is None:
        summarizer_pipeline = pipeline(
            "summarization",
            model="facebook/bart-large-cnn"
        )
    return summarizer_pipeline

app = FastAPI(title="Softech AI Microservice")

# Request models
class DocumentRequest(BaseModel):
    file_path: str

class AskRequest(BaseModel):
    question: str
    file_path: Optional[str] = None

# Process uploaded document
@app.post("/process-document")
def process_document(request: DocumentRequest):
    try:
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=400, detail="File not found")
        
        # Detect file type and extract text accordingly
        file_ext = os.path.splitext(request.file_path)[1].lower()
        if file_ext in ['.xlsx', '.xls']:
            text = extract_text_from_excel(request.file_path)
        else:
            # Assume PDF or image
            text = extract_text_from_file(request.file_path)
        
        if not text:
            raise HTTPException(status_code=400, detail="Failed to extract text from file")
        
        # Generate summary if text is long enough
        summary = None
        if len(text) > 200:
            try:
                summarizer = get_summarizer_pipeline()
                # Limit input to avoid memory issues (BART max is 1024 tokens)
                text_to_summarize = text[:3000]
                summary_result = summarizer(text_to_summarize, max_length=150, min_length=30, do_sample=False)
                
                # Handle different response formats
                if isinstance(summary_result, list) and len(summary_result) > 0:
                    if isinstance(summary_result[0], dict) and 'summary_text' in summary_result[0]:
                        summary = summary_result[0]['summary_text']
                    else:
                        summary = str(summary_result[0])
            except Exception as e:
                print(f"Summarization failed: {e}")
                import traceback
                traceback.print_exc()
                summary = None
        
        return {"summary": summary, "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Answer question about document
@app.post("/ask-document")
def ask_document(request: AskRequest):
    try:
        if not request.question:
            raise HTTPException(status_code=400, detail="question is required")

        # Require file_path
        if not request.file_path:
            raise HTTPException(status_code=400, detail="file_path is required")
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=400, detail="File not found")

        # Detect file type and use appropriate Q&A strategy
        file_ext = os.path.splitext(request.file_path)[1].lower()
        
        if file_ext in ['.xlsx', '.xls']:
            # Use pandas-based keyword search for Excel
            answer = answer_question_on_excel(request.file_path, request.question)
        else:
            # Use DocVQA pipeline for PDF/images
            pipe = get_doc_qa_pipeline()
            result = pipe(request.file_path, question=request.question)
            answer = result[0]["answer"] if isinstance(result, list) and result else result.get("answer")
        
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
