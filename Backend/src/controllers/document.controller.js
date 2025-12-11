import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

import { processDocument, askDocument } from '../utils/ApiClient.js';

const uploadDocument = asyncHandler(async (req, res, next) => {
    try {
        const filePath = req.file?.path;
        const data = await processDocument(filePath);

        res.status(200).json(new ApiResponse(true, 'Document processed successfully', data));
    } catch (error) {
        next(new ApiError(500, 'Failed to process document'));
    }
});

const askQuestion = asyncHandler(async (req, res, next) => {
    try {
        const { document_text, question } = req.body;
        const data = await askDocument(document_text, question);
        res.status(200).json(new ApiResponse(true, 'Question answered successfully', data));
    } catch (error) {
        next(new ApiError(500, 'Failed to get answer'));
    }
});

export { uploadDocument, askQuestion };