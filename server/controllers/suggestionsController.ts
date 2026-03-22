/**
 * Suggestions Controller
 * Handles question suggestion API endpoints
 * Author: [Teammate 2 Name]
 */

import { Request, Response } from 'express';
import { sessionStore } from '../utils/sessionStore';
import { getSuggestions } from '../utils/topicExtractor';

interface QuestionBank {
    questions: any[];
    lastUpdated: number;
}

// Store question banks per session
export const questionBanks = new Map<string, QuestionBank>();

/**
 * Generate question bank from uploaded documents using AI
 */
export async function handleGenerateQuestions(req: Request, res: Response): Promise<void> {
    try {
        const sessionId = req.session.id;
        const session = sessionStore.get(sessionId);

        if (!session || session.documents.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No documents uploaded. Please upload PDFs first.'
            });
            return;
        }

        console.log(`[Suggestions] Generating AI-powered questions for session ${sessionId}`);

        // Combine all document texts (limit to first 8000 chars for AI processing)
        const combinedText = session.documents
            .map(doc => doc.text)
            .join('\n\n')
            .substring(0, 8000);

        // Generate questions using AI
        const questions = await generateQuestionsWithAI(combinedText);

        // Store in question bank
        questionBanks.set(sessionId, {
            questions,
            lastUpdated: Date.now()
        });

        console.log(`[Suggestions] Generated ${questions.length} AI-powered questions`);

        res.json({
            success: true,
            questionsCount: questions.length,
            questions: questions.slice(0, 10), // Return top 10 for preview
            message: 'Question bank generated successfully'
        });
    } catch (error) {
        console.error('[Suggestions] Error generating questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate questions'
        });
    }
}

/**
 * Generate intelligent questions using Groq AI
 */
async function generateQuestionsWithAI(text: string): Promise<any[]> {
    try {
        const prompt = `You are an educational AI assistant. Based on the following document content, generate 15 intelligent, relevant questions that a student might ask to understand the material better.

Document Content:
${text}

Generate questions that are:
- Specific to the actual content (not generic)
- Varied in type (what, how, why, explain, compare, list, describe)
- Educational and meaningful
- Natural and conversational

Return ONLY a JSON array of objects with this format:
[
  {"question": "What is the main purpose of...", "category": "understanding"},
  {"question": "How does X work?", "category": "mechanism"},
  {"question": "Explain the concept of...", "category": "explanation"}
]

Categories: understanding, mechanism, explanation, comparison, application, definition, features, requirements`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a helpful educational assistant that generates relevant questions.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse questions from AI response');
        }

        const questions = JSON.parse(jsonMatch[0]);
        
        // Add keywords for fuzzy matching
        return questions.map((q: any) => ({
            ...q,
            keywords: extractKeywords(q.question),
            relevance: 1
        }));

    } catch (error) {
        console.error('[AI] Error generating questions:', error);
        // Fallback to basic questions if AI fails
        return [
            { question: "What is the main topic of this document?", category: "understanding", keywords: ["main", "topic"], relevance: 1 },
            { question: "Can you summarize the key points?", category: "summary", keywords: ["summarize", "key"], relevance: 1 },
            { question: "What are the important concepts covered?", category: "understanding", keywords: ["concepts", "covered"], relevance: 1 },
            { question: "Explain the main ideas in detail", category: "explanation", keywords: ["explain", "ideas"], relevance: 1 },
            { question: "What should I know about this content?", category: "understanding", keywords: ["know", "content"], relevance: 1 }
        ];
    }
}

/**
 * Extract keywords from question for matching
 */
function extractKeywords(question: string): string[] {
    const stopwords = new Set(['what', 'how', 'why', 'when', 'where', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    return question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopwords.has(word));
}

/**
 * Get question suggestions based on user input
 */
export function handleGetSuggestions(req: Request, res: Response): void {
    try {
        const sessionId = req.session.id;
        const { input, limit = 5 } = req.query;

        // Get question bank for this session
        const questionBank = questionBanks.get(sessionId);

        if (!questionBank) {
            res.status(404).json({
                success: false,
                error: 'Question bank not found. Please generate questions first.',
                suggestions: []
            });
            return;
        }

        // Get suggestions based on input
        const suggestions = getSuggestions(
            input as string || '',
            questionBank.questions,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            suggestions: suggestions.map(s => ({
                question: s.question,
                category: s.category,
                keywords: s.keywords
            })),
            count: suggestions.length
        });
    } catch (error) {
        console.error('[Suggestions] Error getting suggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions',
            suggestions: []
        });
    }
}

/**
 * Get popular/recommended questions
 */
export function handleGetPopularQuestions(req: Request, res: Response): void {
    try {
        const sessionId = req.session.id;
        const { limit = 8 } = req.query;

        const questionBank = questionBanks.get(sessionId);

        if (!questionBank) {
            res.json({
                success: true,
                questions: [],
                message: 'No questions available yet'
            });
            return;
        }

        // Return top questions by relevance
        const popularQuestions = questionBank.questions
            .slice(0, parseInt(limit as string))
            .map(q => ({
                question: q.question,
                category: q.category
            }));

        res.json({
            success: true,
            questions: popularQuestions,
            count: popularQuestions.length
        });
    } catch (error) {
        console.error('[Suggestions] Error getting popular questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get popular questions',
            questions: []
        });
    }
}

/**
 * Clear question bank for session
 */
export function handleClearQuestions(req: Request, res: Response): void {
    try {
        const sessionId = req.session.id;
        questionBanks.delete(sessionId);

        res.json({
            success: true,
            message: 'Question bank cleared'
        });
    } catch (error) {
        console.error('[Suggestions] Error clearing questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear questions'
        });
    }
}
