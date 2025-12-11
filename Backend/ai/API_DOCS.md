# Softech AI Microservice - API Documentation

## Overview
FastAPI-based microservice for document processing and question answering supporting Excel files, PDFs, and images.

**Base URL:** `http://localhost:8000`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- pip/conda

### Quick Start

1. **Create Python 3.10 Virtual Environment:**
   ```bash
   py -3.10 -m venv venv310
   ```

2. **Activate Environment:**
   ```bash
   .\venv310\Scripts\Activate.ps1
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install sentencepiece
   ```

4. **Run Server:**
   ```bash
   uvicorn main:app --app-dir "D:\Github\SoftechAI\Backend\ai" --host 0.0.0.0 --port 8000
   ```

Server will start at `http://localhost:8000`

---

## API Endpoints

### 1. **Process Document** (Text Extraction)
Extract text from Excel, PDF, or image files.

**Endpoint:** `POST /process-document`

**Request:**
```json
{
  "file_path": "C:\\Users\\LEGION\\Downloads\\file.xlsx"
}
```

**Response:**
```json
{
  "summary": null,
  "text": "Sheet: Sheet1\nCountry Year Rank Total S1: Demographic Pressures...\nSomalia 2023 1st 111.9 10 9 8.7..."
}
```

**Supported Formats:**
- **Excel:** `.xlsx`, `.xls` (structured data)
- **PDF:** `.pdf` (OCR via PaddleOCR)
- **Images:** `.png`, `.jpg`, `.jpeg`, `.bmp` (OCR via PaddleOCR)

**Status Codes:**
- `200` - Success
- `400` - File not found / Extraction failed
- `500` - Server error

**Example (cURL):**
```bash
curl -X POST "http://localhost:8000/process-document" \
  -H "Content-Type: application/json" \
  -d '{"file_path":"C:\\path\\to\\file.xlsx"}'
```

**Example (PowerShell):**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/process-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\path\\to\\file.xlsx"}'
$response.Content | ConvertFrom-Json
```

---

### 2. **Ask Document** (Question Answering)
Ask questions about document content. Uses keyword search for Excel, DocVQA for PDFs/images.

**Endpoint:** `POST /ask-document`

**Request:**
```json
{
  "file_path": "C:\\Users\\LEGION\\Downloads\\file.xlsx",
  "question": "What is the rank of Somalia?"
}
```

**Response (Excel):**
```json
{
  "answer": "Question: What is the rank of Somalia?\n\nResults:\nSheet 'Sheet1', Column 'Country':\n   Country  Year Rank  Total  S1: Demographic Pressures...\n0  Somalia  2023  1st  111.9  10.0  9.0..."
}
```

**Response (PDF/Image - DocVQA):**
```json
{
  "answer": "1st rank"
}
```

**Behavior:**
- **Excel Files:** Keyword-based search across all sheets and columns
- **PDF/Image Files:** Visual document question answering (DocVQA model)

**Status Codes:**
- `200` - Success
- `400` - File not found / Question required
- `500` - Server error

**Example (cURL):**
```bash
curl -X POST "http://localhost:8000/ask-document" \
  -H "Content-Type: application/json" \
  -d '{"file_path":"C:\\path\\to\\file.xlsx","question":"What is the rank of Somalia?"}'
```

**Example (PowerShell):**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/ask-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\path\\to\\file.xlsx","question":"What is Somalia rank?"}'
$response.Content | ConvertFrom-Json
```

---

## Request Models

### DocumentRequest
```python
{
  "file_path": str  # Required. Full path to the file
}
```

### AskRequest
```python
{
  "question": str,           # Required. Question to ask about the document
  "file_path": str           # Required. Full path to the file
}
```

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.110.0 | Web framework |
| **Uvicorn** | 0.30.1 | ASGI server |
| **PaddleOCR** | 2.7.0.3 | Text extraction from images/PDFs |
| **Transformers** | 4.38.2 | DocVQA model for document Q&A |
| **openpyxl** | 3.1.5 | Excel file reading |
| **pandas** | 2.3.3 | Data processing for Excel Q&A |
| **Torch** | 2.9.1 | Deep learning backend (CPU) |
| **PaddlePaddle** | 2.6.2 | OCR backend (CPU) |

---

## Performance Notes

### First Run
- **DocVQA Model**: ~2-3 GB download on first question about PDF/image
- **PaddleOCR Models**: ~16 MB download on first document processing

### Processing Time
- **Excel Extraction:** <1 second
- **Excel Q&A:** <100ms (keyword search)
- **Image/PDF OCR:** 1-5 seconds (first run: +5-10s for model download)
- **Image/PDF Q&A:** 5-30 seconds (first run: +2-3 min for model download)

### CPU vs GPU
Currently configured for **CPU only** (no CUDA).  
To enable GPU:
1. Install CUDA-enabled PyTorch
2. Update `paddlepaddle-gpu` wheel
3. Set `device=0` in pipeline calls

---

## File Structure

```
Backend/ai/
├── main.py              # FastAPI application
├── ocr_util.py          # Document processing utilities
├── requirements.txt     # Python dependencies
├── venv310/             # Python 3.10 virtual environment
└── public/temp/         # Temporary file storage
```

---

## Error Handling

### Common Errors

**File Not Found**
```json
{
  "detail": "File not found"
}
```
*Solution:* Verify file path is correct and file exists.

**Module Missing**
```
ModuleNotFoundError: No module named 'sentencepiece'
```
*Solution:* 
```bash
pip install sentencepiece
```

**Port Already in Use**
```
OSError: [Errno 10048] only one usage of each socket address
```
*Solution:* Kill existing process or use different port:
```bash
uvicorn main:app --port 8001
```

---

## Example Workflows

### Workflow 1: Extract Data from Excel
```powershell
# Extract text from Excel file
$response = Invoke-WebRequest -Uri "http://localhost:8000/process-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\data\\report.xlsx"}'

$data = $response.Content | ConvertFrom-Json
Write-Host $data.text
```

### Workflow 2: Query Excel Data
```powershell
# Ask question about Excel data
$response = Invoke-WebRequest -Uri "http://localhost:8000/ask-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\data\\report.xlsx","question":"Show countries with rank less than 10"}'

$answer = ($response.Content | ConvertFrom-Json).answer
Write-Host $answer
```

### Workflow 3: OCR Document with Question
```powershell
# Extract text from scanned PDF using OCR
$response = Invoke-WebRequest -Uri "http://localhost:8000/process-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\docs\\scan.pdf"}'

$text = ($response.Content | ConvertFrom-Json).text

# Ask about the content
$qaResponse = Invoke-WebRequest -Uri "http://localhost:8000/ask-document" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"file_path":"C:\\docs\\scan.pdf","question":"What is the main topic?"}'

$answer = ($qaResponse.Content | ConvertFrom-Json).answer
```

---

## API Testing

### Using Interactive Docs (Swagger UI)
Open in browser: `http://localhost:8000/docs`
- Explore all endpoints
- Test with example requests
- View response schemas

### Using cURL
```bash
# Test extraction
curl -X POST "http://localhost:8000/process-document" \
  -H "Content-Type: application/json" \
  -d "{\"file_path\":\"C:\\\\Users\\\\LEGION\\\\Downloads\\\\file.xlsx\"}"

# Test question answering
curl -X POST "http://localhost:8000/ask-document" \
  -H "Content-Type: application/json" \
  -d "{\"file_path\":\"C:\\\\Users\\\\LEGION\\\\Downloads\\\\file.xlsx\",\"question\":\"What is Somalia rank?\"}"
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:8000/process-document`
3. Body (raw JSON):
   ```json
   {"file_path":"C:\\path\\to\\file.xlsx"}
   ```
4. Send request

---

## Logging & Debugging

### Enable Debug Logging
```bash
uvicorn main:app --log-level debug
```

### View Request/Response
- Check server terminal output for request logs
- Review `detail` field in error responses

---

## Known Limitations

1. **Excel Q&A**: Keyword-based search only (not semantic)
2. **DocVQA**: Optimized for documents, not complex tables
3. **Language**: Currently English (`en`) only; Nepali requires config change
4. **File Size**: Large files (>100MB) may cause memory issues
5. **Concurrent Requests**: Single-threaded OCR (sequential processing)

---

## Future Enhancements

- [ ] GPU acceleration (CUDA support)
- [ ] Semantic search for Excel (embeddings-based)
- [ ] Multi-language support (Devanagari, Hindi, etc.)
- [ ] Batch processing API
- [ ] File upload endpoint (instead of file paths)
- [ ] Caching for repeated queries
- [ ] Authentication/API keys

---

## Support & Troubleshooting

**Server won't start?**
- Check Python version: `python --version` (should be 3.10)
- Verify venv activation
- Check port availability: `netstat -ano | findstr :8000`

**Slow performance?**
- First requests download models (normal)
- Check available RAM
- For large files, consider GPU upgrade

**Questions not accurate?**
- Excel: Use simpler keywords
- PDF: Ensure good image quality
- Adjust question wording

---

## Version Info
- **Created:** December 11, 2025
- **Python:** 3.10
- **FastAPI:** 0.110.0
- **Status:** Production Ready ✅
