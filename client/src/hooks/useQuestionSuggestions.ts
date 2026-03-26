/**
 * Question Suggestions Hook
 * Manages question suggestions state and API calls
 * Author: [Teammate 2 Name]
 */

import { useState, useCallback } from 'react';
import { API_BASE } from '../config';

interface Suggestion {
    question: string;
    category: string;
    keywords?: string[];
}

export function useQuestionSuggestions() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [popularQuestions, setPopularQuestions] = useState<Suggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Generate question bank from uploaded documents
     */
    const generateQuestions = useCallback(async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/suggestions/generate`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to generate questions');
            }

            console.log(`[Suggestions] Generated ${data.questionsCount} questions`);
            
            // Fetch popular questions after generation
            await fetchPopularQuestions();
            
            return data;
        } catch (err: any) {
            console.error('[Suggestions] Error generating questions:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * Get suggestions based on user input
     */
    const getSuggestions = useCallback(async (input: string, limit: number = 5) => {
        if (!input || input.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE}/suggestions/search?input=${encodeURIComponent(input)}&limit=${limit}`,
                {
                    credentials: 'include',
                }
            );

            const data = await response.json();

            if (data.success) {
                setSuggestions(data.suggestions || []);
            } else {
                setSuggestions([]);
            }
        } catch (err: any) {
            console.error('[Suggestions] Error getting suggestions:', err);
            setError(err.message);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch popular/recommended questions
     */
    const fetchPopularQuestions = useCallback(async (limit: number = 8) => {
        try {
            const response = await fetch(
                `${API_BASE}/suggestions/popular?limit=${limit}`,
                {
                    credentials: 'include',
                }
            );

            const data = await response.json();

            if (data.success) {
                setPopularQuestions(data.questions || []);
            }
        } catch (err: any) {
            console.error('[Suggestions] Error fetching popular questions:', err);
        }
    }, []);

    /**
     * Clear question bank
     */
    const clearQuestions = useCallback(async () => {
        try {
            await fetch(`${API_BASE}/suggestions/clear`, {
                method: 'DELETE',
                credentials: 'include',
            });

            setSuggestions([]);
            setPopularQuestions([]);
        } catch (err: any) {
            console.error('[Suggestions] Error clearing questions:', err);
        }
    }, []);

    return {
        suggestions,
        popularQuestions,
        isGenerating,
        isLoading,
        error,
        generateQuestions,
        getSuggestions,
        fetchPopularQuestions,
        clearQuestions,
    };
}
