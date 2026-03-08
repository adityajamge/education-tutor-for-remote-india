import { useTypewriter } from '../hooks/useTypewriter';

const PremiumAppIcon = ({ size = 48 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
    </svg>
);

const SUBTITLES = [
    "AI tutor designed for students in remote India",
    "Learn faster from your textbooks with AI",
    "Smart tutoring optimized for low-bandwidth regions",
    "Understand your state-board textbooks instantly",
    "Affordable AI learning for every student",
    "Your personal study companion for exam preparation",
    "Ask questions directly from your textbooks",
    "AI-powered explanations made simple",
    "Learning made accessible across rural India",
    "Context-compressed AI for faster answers"
];

export default function WelcomeScreen() {
    const displayText = useTypewriter(SUBTITLES, 50, 15, 2000);
    return (
        <div className="welcome">
            <div className="welcome__hero">
                <div className="welcome__logo-glow">
                    <PremiumAppIcon size={48} />
                </div>
                <h2 className="welcome__heading">
                    Welcome to <span className="welcome__brand">EduTutor</span>
                </h2>
                <div className="welcome__tagline" style={{
                    minHeight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                }}>
                    <p style={{ margin: 0 }}>
                        {displayText}
                    </p>
                    <div className="welcome__cursor" />
                </div>
            </div>
        </div>
    );
}
