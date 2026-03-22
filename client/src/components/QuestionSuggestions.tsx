/**
 * Question Suggestions Component
 * Displays auto-complete suggestions as user types
 * Author: [Teammate 2 Name]
 */

import { useEffect, useRef } from 'react';
import './QuestionSuggestions.css';

const LightbulbIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
    </svg>
);

const SparklesIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 7.41L22 10L14.59 12.59L12 20L9.41 12.59L2 10L9.41 7.41L12 0Z"></path>
        <path d="M19 10L20.18 13.82L24 15L20.18 16.18L19 20L17.82 16.18L14 15L17.82 13.82L19 10Z"></path>
    </svg>
);

interface Suggestion {
    question: string;
    category: string;
    keywords?: string[];
}

interface QuestionSuggestionsProps {
    suggestions: Suggestion[];
    onSelect: (question: string) => void;
    isLoading?: boolean;
    inputValue: string;
}

export default function QuestionSuggestions({
    suggestions,
    onSelect,
    isLoading,
    inputValue
}: QuestionSuggestionsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Parent component should handle closing
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!inputValue || inputValue.length < 2) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="suggestions-dropdown" ref={containerRef}>
                <div className="suggestions-loading">
                    <div className="suggestions-spinner"></div>
                    <span>Finding suggestions...</span>
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="suggestions-dropdown" ref={containerRef}>
            <div className="suggestions-header">
                <SparklesIcon size={14} />
                <span>Suggested Questions</span>
            </div>
            <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        className="suggestion-item"
                        onClick={() => onSelect(suggestion.question)}
                        type="button"
                    >
                        <div className="suggestion-icon">
                            <LightbulbIcon size={16} />
                        </div>
                        <div className="suggestion-content">
                            <div className="suggestion-question">{suggestion.question}</div>
                            <div className="suggestion-category">{suggestion.category}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
