import {Router} from 'express';
import { uploadDocument, askQuestion } from '../controllers/document.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/').post(
    upload.single('document'),
    uploadDocument
);
router.route('/ask').post(askQuestion);

export default router;