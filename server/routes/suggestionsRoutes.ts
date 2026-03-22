/**
 * Suggestions Routes
 * API routes for question suggestions
 * Author: [Teammate 2 Name]
 */

import { Router } from 'express';
import {
    handleGenerateQuestions,
    handleGetSuggestions,
    handleGetPopularQuestions,
    handleClearQuestions
} from '../controllers/suggestionsController';

const router = Router();

// Generate question bank from uploaded documents
router.post('/generate', handleGenerateQuestions);

// Get suggestions based on user input
router.get('/search', handleGetSuggestions);

// Get popular/recommended questions
router.get('/popular', handleGetPopularQuestions);

// Clear question bank
router.delete('/clear', handleClearQuestions);

export default router;
