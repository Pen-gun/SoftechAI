import axios from 'axios';

const pythonServiceURL = process.env.PYTHON_SERVICE_URL;

const processDocument = async (filePath) => {
  try {
    const response = await axios.post(`${pythonServiceURL}/process-document`, { file_path: filePath });
    return response.data;
  } catch (error) {
    console.error('Error calling processDocument:', error.message);
    throw new Error(`AI Service Error: ${error.response?.data?.detail || error.message}`);
  }
};

const askDocument = async (filePath, question) => {
  try {
    const response = await axios.post(`${pythonServiceURL}/ask-document`, { file_path: filePath, question });
    return response.data;
  } catch (error) {
    console.error('Error calling askDocument:', error.message);
    throw new Error(`AI Service Error: ${error.response?.data?.detail || error.message}`);
  }
};

export { processDocument, askDocument };