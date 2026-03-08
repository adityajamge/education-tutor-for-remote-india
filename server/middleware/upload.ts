import multer from 'multer';
import { Request } from 'express';

const upload = multer({
    storage: multer.memoryStorage(), // Keep file in RAM as Buffer, never write to disk
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
    fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

// Accept up to 5 PDF files under the field name 'pdfs'
export const uploadPdfs = upload.array('pdfs', 5);
