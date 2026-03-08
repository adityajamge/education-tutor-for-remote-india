import { useState, useEffect } from 'react';

export function useTypewriter(texts: string[], typingSpeed = 50, deletingSpeed = 20, pauseDuration = 4000) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const currentString = texts[currentIndex];

        if (isTyping) {
            if (displayText.length < currentString.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentString.slice(0, displayText.length + 1));
                }, typingSpeed);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, pauseDuration);
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(currentString.slice(0, displayText.length - 1));
                }, deletingSpeed);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(true);
                    setCurrentIndex((prev) => (prev + 1) % texts.length);
                }, 0);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isTyping, currentIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return displayText;
}
