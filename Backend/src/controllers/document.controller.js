import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';

import { processDocument, askDocument } from '../utils/ApiClient.js';

const uploadDocument = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ApiError('no file uploaded', 400));
    }
    const filePath = req.file?.path;
    const data = await processDocument(filePath);
    if (!data) {
        return next(new ApiError('Document processing failed', 500));
    }

    try {
        res.status(200).json(new ApiResponse(200, data, 'Document processed successfully'));
    } catch (error) {
        console.error('Error sending response:', error);
        return next(new ApiError('Internal Server Error', 500));
    }finally{
        fs.unlinkSync(filePath);
    }
});

const askQuestion = asyncHandler(async (req, res, next) => {

    const { document_text, question } = req.body;
    if (!document_text || !question){
        return next(new ApiError('document_text and question are required', 400));
    }
    const data = await askDocument(document_text, question);
    if (!data){
        return next(new ApiError('Failed to get answer from document', 500));
    }
    res.status(200).json(new ApiResponse(200,data, 'Question answered successfully'));
});

export { uploadDocument, askQuestion };