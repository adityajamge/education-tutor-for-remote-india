import { Router } from 'express';
import { uploadPdfs } from '../middleware/upload';
import { handleUpload, handleSessionStatus, handleRemoveDocument, handleEndSession } from '../controllers/pdfController';

const router = Router();

// POST /api/upload-pdf — Upload 1-5 PDF files
router.post('/upload-pdf', uploadPdfs, handleUpload);

// GET /api/session-status — Get currently uploaded documents
router.get('/session-status', handleSessionStatus);

// DELETE /api/document/:docId — Remove a specific PDF
router.delete('/document/:docId', handleRemoveDocument);

// POST /api/end-session — Clear memory
router.post('/end-session', handleEndSession);

export default router;
