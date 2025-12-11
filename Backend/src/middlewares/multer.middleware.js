import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const err = new Error('Unsupported file type');
    err.code = 'UNSUPPORTED_FILE_TYPE';
    cb(err, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});