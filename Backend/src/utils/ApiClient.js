import axios from 'axios';

const pythonServiceURL = process.env.PYTHON_SERVICE_URL;

const processDocument = async (filePath) => {
  const response = await axios.post(`${pythonServiceURL}/process-document`, { file_path: filePath });
  return response.data;
};

const askDocument = async (document_text, question) => {
  const response = await axios.post(`${pythonServiceURL}/ask-document`, { document_text, question });
  return response.data;
};

export { processDocument, askDocument };