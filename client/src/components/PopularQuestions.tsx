/**
 * Popular Questions Component
 * Displays "People also asked" style questions
 * Author: [Teammate 2 Name]
 */

import './PopularQuestions.css';

const TrendingIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const ArrowRightIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

interface Question {
    question: string;
    category: string;
}

interface PopularQuestionsProps {
    questions: Question[];
    onSelect: (question: string) => void;
    isLoading?: boolean;
}

export default function PopularQuestions({ questions, onSelect, isLoading }: PopularQuestionsProps) {
    if (isLoading) {
        return (
            <div className="popular-questions">
                <div className="popular-questions__header">
                    <TrendingIcon size={18} />
                    <h3>People also asked</h3>
                </div>
                <div className="popular-questions__loading">
                    <div className="popular-spinner"></div>
                    <span>Generating questions...</span>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return null;
    }

    return (
        <div className="popular-questions">
            <div className="popular-questions__header">
                <TrendingIcon size={18} />
                <h3>People also asked</h3>
            </div>
            <div className="popular-questions__grid">
                {questions.map((q, index) => (
                    <button
                        key={index}
                        className="popular-question-card"
                        onClick={() => onSelect(q.question)}
                        type="button"
                    >
                        <div className="popular-question-card__content">
                            <span className="popular-question-card__text">{q.question}</span>
                            <span className="popular-question-card__category">{q.category}</span>
                        </div>
                        <div className="popular-question-card__icon">
                            <ArrowRightIcon size={16} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
