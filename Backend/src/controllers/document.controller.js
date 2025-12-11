import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';
import path from 'path';

import { processDocument, askDocument } from '../utils/ApiClient.js';

const uploadDocument = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ApiError('no file uploaded', 400));
    }
    const filePath = path.resolve(req.file.path);
    const data = await processDocument(filePath);
    if (!data) {
        return next(new ApiError('Document processing failed', 500));
    }

    try {
        // include file info so frontend can reference it later
        res.status(200).json(
            new ApiResponse(
                200,
                { ...data, file_path: filePath, filename: req.file.filename, originalname: req.file.originalname },
                'Document processed successfully'
            )
        );
    } catch (error) {
        console.error('Error sending response:', error);
        return next(new ApiError('Internal Server Error', 500));
    }
});

const askQuestion = asyncHandler(async (req, res, next) => {

    const { file_name, question } = req.body;
    if (!file_name || !question){
        return next(new ApiError('file_name and question are required', 400));
    }
    const file_path = path.join(process.env.FILE_UPLOAD_PATH, file_name);
    const data = await askDocument(file_path, question);
    if (!data){
        return next(new ApiError('Failed to get answer from document', 500));
    }
    res.status(200).json(new ApiResponse(200, data, 'Question answered successfully'));
});

export { uploadDocument, askQuestion };