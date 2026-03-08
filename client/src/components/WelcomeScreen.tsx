import { GraduationCap, BookOpen, Zap, Globe } from 'lucide-react';

interface WelcomeScreenProps {
    onQuestionSelect: (question: string) => void;
}

const explorerCards = [
    {
        icon: BookOpen,
        title: 'Ask about Textbooks',
        description: 'Get explanations from your state-board curriculum',
        question: 'Explain a concept from my textbook',
        gradient: 'var(--gradient-purple)',
    },
    {
        icon: Zap,
        title: 'Quick Doubts',
        description: 'Get instant clarity on difficult topics',
        question: 'I have a doubt about a topic in my syllabus',
        gradient: 'var(--gradient-blue)',
    },
    {
        icon: GraduationCap,
        title: 'Exam Preparation',
        description: 'Prepare for your upcoming exams with AI help',
        question: 'Help me prepare for my exams',
        gradient: 'var(--gradient-orange)',
    },
    {
        icon: Globe,
        title: 'General Knowledge',
        description: 'Explore topics beyond your textbooks',
        question: 'Tell me something interesting about science',
        gradient: 'var(--gradient-green)',
    },
];

export default function WelcomeScreen({ onQuestionSelect }: WelcomeScreenProps) {
    return (
        <div className="welcome">
            <div className="welcome__hero">
                <div className="welcome__logo-glow">
                    <GraduationCap size={48} />
                </div>
                <h2 className="welcome__heading">
                    Welcome to <span className="welcome__brand">EduTutor</span>
                </h2>
                <p className="welcome__tagline">
                    Your AI-powered learning companion for state-board curriculum
                </p>
            </div>

            <h3 className="welcome__explore-title">Explore</h3>
            <div className="welcome__cards">
                {explorerCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={index}
                            className="welcome__card"
                            onClick={() => onQuestionSelect(card.question)}
                            id={`explore-card-${index}`}
                            style={{ '--card-gradient': card.gradient } as React.CSSProperties}
                        >
                            <div className="welcome__card-icon">
                                <Icon size={22} />
                            </div>
                            <div className="welcome__card-text">
                                <h4>{card.title}</h4>
                                <p>{card.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
