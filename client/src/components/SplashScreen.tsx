import { useEffect, useState } from 'react';
import './SplashScreen.css';

const PremiumAppIcon = ({ size = 48 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
    </svg>
);

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Progress bar animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 4;
            });
        }, 100);

        // Fade out after 2.5 seconds
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 600);
        }, 2500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <div className={`splash-screen ${fadeOut ? 'splash-screen--fade-out' : ''}`}>
            <div className="splash-screen__content">
                <div className="splash-screen__logo">
                    <PremiumAppIcon size={48} />
                </div>
                <h1 className="splash-screen__title">EduTutor</h1>
                <p className="splash-screen__tagline">AI-powered learning for every student</p>
                <div className="splash-screen__progress">
                    <div 
                        className="splash-screen__progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="splash-screen__loading">Loading</p>
            </div>
        </div>
    );
}
