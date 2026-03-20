import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { DocumentSection, sessionStore } from '../utils/sessionStore';

const MAX_SECTIONS_FOR_SCALEDOWN = 8;
const FALLBACK_SECTION_CHAR_LIMIT = 12000;

function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

function splitIntoSections(rawText: string): DocumentSection[] {
    const text = rawText.replace(/\r/g, '');
    const headingRegex = /(^|\n)(?:chapter|unit|lesson)\s+\d+[\s:.-]*([^\n]{0,80})/gim;
    const matches = Array.from(text.matchAll(headingRegex));

    if (matches.length === 0) {
        const trimmed = text.trim().slice(0, FALLBACK_SECTION_CHAR_LIMIT);
        return [{
            id: uuidv4(),
            title: 'Full Text',
            text: trimmed,
            charCount: trimmed.length,
        }];
    }

    const sections: DocumentSection[] = [];
    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const start = (current.index || 0) + current[0].length;
        const end = i + 1 < matches.length ? (matches[i + 1].index || text.length) : text.length;
        const titleSuffix = normalizeWhitespace(current[2] || '');
        const title = titleSuffix ? `Chapter ${i + 1}: ${titleSuffix}` : `Chapter ${i + 1}`;
        const sectionText = text.slice(start, end).trim();

        if (!sectionText) {
            continue;
        }

        sections.push({
            id: uuidv4(),
            title,
            text: sectionText,
            charCount: sectionText.length,
        });
    }

    if (sections.length === 0) {
        const trimmed = text.trim().slice(0, FALLBACK_SECTION_CHAR_LIMIT);
        sections.push({
            id: uuidv4(),
            title: 'Full Text',
            text: trimmed,
            charCount: trimmed.length,
        });
    }

    return sections;
}

function tokenize(text: string): Set<string> {
    return new Set(
        text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((token) => token.length > 2)
    );
}

function scoreSection(questionTokens: Set<string>, sectionText: string, title: string): number {
    const sectionTokens = tokenize(`${title} ${sectionText.slice(0, 4000)}`);
    let overlap = 0;
    for (const token of questionTokens) {
        if (sectionTokens.has(token)) {
            overlap++;
        }
    }
    return overlap;
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

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
            const sections = splitIntoSections(pdfData.text);

            console.log(`[Upload] PDF parsed: ${file.originalname}`);
            console.log(`[Upload] Extracted text length: ${pdfData.text.length} characters`);
            console.log(`[Upload] Sections indexed: ${sections.length}`);

            const doc = {
                id: uuidv4(),
                fileName: file.originalname,
                text: pdfData.text,
                pageCount: pdfData.numpages,
                uploadedAt: Date.now(),
                buffer: file.buffer, // Store the original PDF buffer
                sections,
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

export async function handleChat(req: Request, res: Response): Promise<void> {
    try {
        const { question } = req.body;
        const sessionId = req.session.id;

        if (!question) {
            res.status(400).json({ success: false, error: 'Question is required' });
            return;
        }

        console.log(`[Chat] Session: ${sessionId}, Question: ${question}`);

        // Get uploaded PDFs from session
        const session = sessionStore.get(sessionId);
        if (!session || session.documents.length === 0) {
            res.status(400).json({ 
                success: false, 
                error: 'No documents uploaded. Please upload a PDF first.' 
            });
            return;
        }

        // Baseline context (all documents) for comparison metrics only.
        const baselineContext = session.documents
            .map(doc => `[${doc.fileName}]\n${doc.text}`)
            .join('\n\n---\n\n');

        const questionTokens = tokenize(question);
        const sectionCandidates = session.documents.flatMap((doc) =>
            doc.sections.map((section) => ({
                documentId: doc.id,
                fileName: doc.fileName,
                sectionId: section.id,
                sectionTitle: section.title,
                sectionText: section.text,
                score: scoreSection(questionTokens, section.text, section.title),
            }))
        );

        const rankedSections = sectionCandidates
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SECTIONS_FOR_SCALEDOWN);

        const selectedSections = rankedSections.some((section) => section.score > 0)
            ? rankedSections.filter((section) => section.score > 0)
            : rankedSections;

        const optimizedContext = selectedSections
            .map((section) => `[${section.fileName} | ${section.sectionTitle}]\n${section.sectionText}`)
            .join('\n\n---\n\n');

        if (!optimizedContext) {
            res.status(400).json({
                success: false,
                error: 'Unable to build relevant context from uploaded documents.',
            });
            return;
        }

        console.log(`[Chat] Baseline context length: ${baselineContext.length} characters`);
        console.log(`[Chat] Selected sections: ${selectedSections.length}/${sectionCandidates.length}`);
        console.log(`[Chat] Optimized context length: ${optimizedContext.length} characters`);

        // Call ScaleDown API
        const requestBody = {
            context: optimizedContext,
            prompt: question,
            scaledown: {
                rate: 'auto'
            }
        };

        console.log(`[Chat] Request body keys:`, Object.keys(requestBody));

        const scaledownResponse = await fetch('https://api.scaledown.xyz/compress/raw/', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.SCALEDOWN_API || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!scaledownResponse.ok) {
            const errorText = await scaledownResponse.text();
            console.error('[Chat] ScaleDown API error:', errorText);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to compress context with ScaleDown API',
                details: 'ScaleDown compression request failed'
            });
            return;
        }

        const scaledownData = await scaledownResponse.json();
        console.log('[Chat] ScaleDown response:', JSON.stringify(scaledownData).substring(0, 200));

        // Extract data from nested results object
        const results = scaledownData.results || scaledownData;
        const compressedContext = results.compressed_prompt;

        console.log(`[Chat] ===== SCALEDOWN COMPRESSION =====`);
        console.log(`[Chat] Original optimized context length: ${optimizedContext.length} chars`);
        console.log(`[Chat] Compressed context length: ${compressedContext.length} chars`);
        console.log(`[Chat] ==================================`);
        console.log(`[Chat] Sending to Groq LLM...`);

        // Call Groq API with compressed context
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI tutor helping students understand their textbook content. Answer questions based on the provided context clearly and concisely.'
                    },
                    {
                        role: 'user',
                        content: `Question: ${question}\n\nContext: ${compressedContext}\n\nBased on the context provided above, please answer the question.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('[Chat] Groq API error:', errorText);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to generate answer with LLM',
                details: 'LLM generation request failed'
            });
            return;
        }

        const groqData = await groqResponse.json();
        const aiAnswer = groqData.choices[0].message.content;

        console.log(`[Chat] AI Answer generated successfully`);

        const baselineEstimatedTokens = estimateTokens(baselineContext);
        const optimizedEstimatedTokens = estimateTokens(optimizedContext);
        const compressedTokens = results.compressed_prompt_tokens || scaledownData.total_compressed_tokens || estimateTokens(compressedContext);
        const routingSavingsPct = baselineEstimatedTokens > 0
            ? Math.round(((baselineEstimatedTokens - optimizedEstimatedTokens) / baselineEstimatedTokens) * 100)
            : 0;
        const totalSavingsPct = baselineEstimatedTokens > 0
            ? Math.round(((baselineEstimatedTokens - compressedTokens) / baselineEstimatedTokens) * 100)
            : 0;

        const selectedChapters = selectedSections.map((section) => ({
            documentId: section.documentId,
            fileName: section.fileName,
            sectionId: section.sectionId,
            chapterTitle: section.sectionTitle,
            relevanceScore: section.score,
        }));

        // Return both ScaleDown and AI responses
        res.json({
            success: true,
            answer: aiAnswer,
            scaledownResponse: {
                original_prompt: question,
                compressed_prompt: compressedContext,
                original_tokens: results.original_prompt_tokens || scaledownData.total_original_tokens || optimizedEstimatedTokens,
                compressed_tokens: compressedTokens,
                compression_ratio: results.compression_ratio || 0
            },
            aiResponse: {
                answer: aiAnswer,
                model: 'llama-3.3-70b-versatile',
                tokens_used: groqData.usage?.total_tokens
            },
            metadata: {
                baseline_estimated_tokens: baselineEstimatedTokens,
                optimized_estimated_tokens: optimizedEstimatedTokens,
                original_tokens: results.original_prompt_tokens || scaledownData.total_original_tokens || optimizedEstimatedTokens,
                compressed_tokens: compressedTokens,
                routing_savings_pct: routingSavingsPct,
                total_savings_pct: totalSavingsPct,
                selected_chapters: selectedChapters,
                selected_sections_count: selectedSections.length,
                total_sections_count: sectionCandidates.length,
                compression_rate: scaledownData.request_metadata?.compression_rate || 'auto',
                scaledown_latency_ms: scaledownData.latency_ms,
                llm_tokens_used: groqData.usage?.total_tokens
            }
        });

    } catch (error) {
        console.error('[Chat] Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process chat request',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export function handleBenchmark(req: Request, res: Response): void {
    const { question } = req.body;
    const sessionId = req.session.id;

    if (!question) {
        res.status(400).json({ success: false, error: 'Question is required' });
        return;
    }

    const session = sessionStore.get(sessionId);
    if (!session || session.documents.length === 0) {
        res.status(400).json({
            success: false,
            error: 'No documents uploaded. Please upload a PDF first.'
        });
        return;
    }

    const baselineContext = session.documents
        .map((doc) => `[${doc.fileName}]\n${doc.text}`)
        .join('\n\n---\n\n');

    const questionTokens = tokenize(question);
    const sectionCandidates = session.documents.flatMap((doc) =>
        doc.sections.map((section) => ({
            fileName: doc.fileName,
            sectionTitle: section.title,
            sectionText: section.text,
            score: scoreSection(questionTokens, section.text, section.title),
        }))
    );

    const selectedSections = sectionCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SECTIONS_FOR_SCALEDOWN);

    const optimizedContext = selectedSections
        .map((section) => `[${section.fileName} | ${section.sectionTitle}]\n${section.sectionText}`)
        .join('\n\n---\n\n');

    const baselineEstimatedTokens = estimateTokens(baselineContext);
    const optimizedEstimatedTokens = estimateTokens(optimizedContext);
    const savingsPct = baselineEstimatedTokens > 0
        ? Math.round(((baselineEstimatedTokens - optimizedEstimatedTokens) / baselineEstimatedTokens) * 100)
        : 0;

    res.json({
        success: true,
        benchmark: {
            baseline_estimated_tokens: baselineEstimatedTokens,
            optimized_estimated_tokens: optimizedEstimatedTokens,
            routing_savings_pct: savingsPct,
            selected_sections_count: selectedSections.length,
            total_sections_count: sectionCandidates.length,
        }
    });
}
