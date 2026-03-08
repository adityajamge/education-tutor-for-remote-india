import { useState } from 'react';
import {
    BookOpen,
    Beaker,
    Calculator,
    Globe,
    Landmark,
    Languages,
    Lightbulb,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    HelpCircle,
    Info,
} from 'lucide-react';

interface SidebarProps {
    onQuestionSelect: (question: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

const subjects = [
    { name: 'Mathematics', icon: Calculator, color: '#6C63FF' },
    { name: 'Science', icon: Beaker, color: '#00D2FF' },
    { name: 'English', icon: Languages, color: '#FF6B6B' },
    { name: 'Social Studies', icon: Globe, color: '#FFD93D' },
    { name: 'History', icon: Landmark, color: '#FF8C42' },
    { name: 'General Knowledge', icon: Lightbulb, color: '#4ECB71' },
];

const suggestedQuestions = [
    'Explain photosynthesis in simple terms',
    'What is the Pythagoras theorem?',
    'Describe the water cycle',
    'What are Newton\'s laws of motion?',
    'Explain the Indian freedom struggle',
    'What are prime numbers?',
];

export default function Sidebar({ onQuestionSelect, collapsed, onToggleCollapse }: SidebarProps) {
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Collapse toggle */}
            <button
                className="sidebar__toggle"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                id="sidebar-toggle"
            >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Brand / Logo */}
            <div className="sidebar__brand">
                <div className="sidebar__logo">
                    <GraduationCap size={collapsed ? 24 : 28} />
                </div>
                {!collapsed && (
                    <div className="sidebar__brand-text">
                        <h1 className="sidebar__title">EduTutor</h1>
                        <span className="sidebar__subtitle">AI Learning Assistant</span>
                    </div>
                )}
            </div>

            {!collapsed && (
                <>
                    {/* Subjects Section */}
                    <div className="sidebar__section">
                        <h2 className="sidebar__section-title">
                            <BookOpen size={14} />
                            <span>Subjects</span>
                        </h2>
                        <ul className="sidebar__subjects">
                            {subjects.map((subject) => {
                                const Icon = subject.icon;
                                return (
                                    <li key={subject.name}>
                                        <button
                                            className={`sidebar__subject-btn ${activeSubject === subject.name ? 'sidebar__subject-btn--active' : ''}`}
                                            onClick={() => {
                                                setActiveSubject(subject.name);
                                                onQuestionSelect(`Help me with ${subject.name}`);
                                            }}
                                            id={`subject-${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
                                        >
                                            <span
                                                className="sidebar__subject-icon"
                                                style={{ '--subject-color': subject.color } as React.CSSProperties}
                                            >
                                                <Icon size={16} />
                                            </span>
                                            <span className="sidebar__subject-name">{subject.name}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Suggested Questions */}
                    <div className="sidebar__section">
                        <h2 className="sidebar__section-title">
                            <Sparkles size={14} />
                            <span>Quick Questions</span>
                        </h2>
                        <ul className="sidebar__questions">
                            {suggestedQuestions.map((q, i) => (
                                <li key={i}>
                                    <button
                                        className="sidebar__question-btn"
                                        onClick={() => onQuestionSelect(q)}
                                        id={`quick-question-${i}`}
                                    >
                                        <HelpCircle size={13} />
                                        <span>{q}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer Info */}
                    <div className="sidebar__footer">
                        <div className="sidebar__info-card">
                            <Info size={14} />
                            <p>Powered by AI with context compression for low-bandwidth areas.</p>
                        </div>
                        <p className="sidebar__credits">
                            Intel Unnati × HPE
                        </p>
                    </div>
                </>
            )}

            {collapsed && (
                <div className="sidebar__collapsed-icons">
                    {subjects.map((subject) => {
                        const Icon = subject.icon;
                        return (
                            <button
                                key={subject.name}
                                className="sidebar__collapsed-icon-btn"
                                onClick={() => {
                                    onToggleCollapse();
                                    setActiveSubject(subject.name);
                                    onQuestionSelect(`Help me with ${subject.name}`);
                                }}
                                title={subject.name}
                                style={{ '--subject-color': subject.color } as React.CSSProperties}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}
