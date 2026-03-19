import { Router } from 'express';
import { uploadPdfs } from '../middleware/upload';
import { handleUpload, handleSessionStatus, handleRemoveDocument, handleEndSession, handleViewDocument, handleChat } from '../controllers/pdfController';

const router = Router();

// POST /api/upload-pdf — Upload 1-5 PDF files
router.post('/upload-pdf', uploadPdfs, handleUpload);

// GET /api/session-status — Get currently uploaded documents
router.get('/session-status', handleSessionStatus);

// GET /api/document/:docId/view — View/download a specific PDF
router.get('/document/:docId/view', handleViewDocument);

// DELETE /api/document/:docId — Remove a specific PDF
router.delete('/document/:docId', handleRemoveDocument);

// POST /api/end-session — Clear memory
router.post('/end-session', handleEndSession);

// POST /api/chat — Ask a question about uploaded documents
router.post('/chat', handleChat);

export default router;
