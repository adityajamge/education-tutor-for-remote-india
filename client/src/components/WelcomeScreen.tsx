import { GraduationCap } from 'lucide-react';

export default function WelcomeScreen() {
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
        </div>
    );
}
