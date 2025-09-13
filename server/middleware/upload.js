import multer from 'multer';
import { InvalidParameterError } from '../utils/errors.js';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only allow one file
    },
    fileFilter: (req, file, cb) => {
        // Check if file is CSV
        if (file.mimetype === 'text/csv' || 
            file.originalname.toLowerCase().endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new InvalidParameterError('Only CSV files are allowed'), false);
        }
    }
});

export const uploadCSV = upload.single('file'); // Expect a single file with field name 'file'

export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Only one file is allowed.' });
        }
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    if (error.message.includes('Only CSV files are allowed')) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
};
