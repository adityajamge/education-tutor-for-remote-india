import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '../utils/sessionStore';

export async function handleUpload(req: Request, res: Response): Promise<void> {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ success: false, error: 'No PDF files uploaded' });
            return;
        }

        // Get session ID from express-session
        const sessionId = req.session.id;
        console.log(`[Upload] Session ID: ${sessionId}`);
        
        const session = sessionStore.getOrCreate(sessionId);
        console.log(`[Upload] Session created/retrieved, current docs: ${session.documents.length}`);

        const newDocuments = [];

        // Parse each uploaded PDF
        for (const file of files) {
            const pdfData = await pdfParse(file.buffer);

            const doc = {
                id: uuidv4(),
                fileName: file.originalname,
                text: pdfData.text,
                pageCount: pdfData.numpages,
                uploadedAt: Date.now(),
                buffer: file.buffer, // Store the original PDF buffer
            };

            session.documents.push(doc); // APPEND — never overwrite
            newDocuments.push({
                id: doc.id,
                fileName: doc.fileName,
                pageCount: doc.pageCount,
            });
        }

        // Save updated session back to store
        sessionStore.set(sessionId, session);

        console.log(`[Upload] Session ${sessionId}: ${session.documents.length} total documents`);
        console.log(`[Upload] Document IDs: ${session.documents.map(d => d.id).join(', ')}`);
        console.log(`[Upload] SessionStore size: ${sessionStore.size()}`);

        res.json({
            success: true,
            newDocuments,
            totalDocuments: session.documents.length,
            allDocuments: session.documents.map((d) => ({
                id: d.id,
                fileName: d.fileName,
                pageCount: d.pageCount,
            })),
        });
    } catch (error) {
        console.error('[Upload] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to process PDF files' });
    }
}

export function handleSessionStatus(req: Request, res: Response): void {
    const sessionId = req.session.id;
    const session = sessionStore.get(sessionId);

    if (!session || session.documents.length === 0) {
        res.json({ success: true, hasDocuments: false, documents: [] });
        return;
    }

    res.json({
        success: true,
        hasDocuments: true,
        documents: session.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            pageCount: d.pageCount,
        })),
    });
}

export function handleRemoveDocument(req: Request, res: Response): void {
    const sessionId = req.session.id;
    const docId = req.params.docId;

    const session = sessionStore.get(sessionId);
    if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
    }

    const initialLength = session.documents.length;
    session.documents = session.documents.filter((d) => d.id !== docId);

    if (session.documents.length === initialLength) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    sessionStore.set(sessionId, session);

    res.json({
        success: true,
        remainingDocuments: session.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            pageCount: d.pageCount,
        })),
    });
}

export function handleEndSession(req: Request, res: Response): void {
    const sessionId = req.session.id;
    const session = sessionStore.get(sessionId);
    
    if (session) {
        // Clear documents but keep the session
        session.documents = [];
        sessionStore.set(sessionId, session);
        console.log(`[EndSession] Cleared documents for session ${sessionId}`);
    }
    
    res.json({ success: true, message: 'Session memory cleared' });
}

export function handleViewDocument(req: Request, res: Response): void {
    const sessionId = req.session.id;
    const docId = req.params.docId;

    console.log(`[ViewDocument] Session: ${sessionId}, DocId: ${docId}`);
    console.log(`[ViewDocument] SessionStore size: ${sessionStore.size()}`);

    const session = sessionStore.get(sessionId);
    if (!session) {
        console.log(`[ViewDocument] Session not found: ${sessionId}`);
        console.log(`[ViewDocument] All session IDs in store:`, Array.from(sessionStore.getAllSessionIds()));
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
    }

    console.log(`[ViewDocument] Session has ${session.documents.length} documents`);

    const document = session.documents.find((d) => d.id === docId);
    if (!document) {
        console.log(`[ViewDocument] Document not found: ${docId}`);
        console.log(`[ViewDocument] Available IDs: ${session.documents.map(d => d.id).join(', ')}`);
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
    }

    console.log(`[ViewDocument] Serving PDF: ${document.fileName}`);

    // Set headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
    res.send(document.buffer);
}
