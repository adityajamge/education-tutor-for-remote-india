import { useState, useRef, useEffect, type FormEvent } from 'react';
import QuestionSuggestions from './QuestionSuggestions';
import { useQuestionSuggestions } from '../hooks/useQuestionSuggestions';

// Custom Spotify UI Icons
const PlusIcon = () => (
    <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
        <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" />
    </svg>
);

const PlayIcon = () => (
    <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" />
    </svg>
);

const MicIcon = () => (
    <svg role="img" height="20" width="20" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 12a4 4 0 0 0 4-4V4a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4zm-5-4a.75.75 0 0 1 1.5 0 3.5 3.5 0 0 0 7 0 .75.75 0 0 1 1.5 0 5 5 0 0 1-4.25 4.935v2.315a.75.75 0 0 1-1.5 0v-2.315A5 5 0 0 1 3 8z" />
    </svg>
);

const LoaderIcon = () => (
    <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chat-input__spinner">
        <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20"></circle>
    </svg>
);

const TAGLINES = [
    "Upload a textbook and ask any question.",
    "EduTutor finds answers directly from your books.",
    "Optimized with AI context compression.",
    "Built for students with limited internet."
];

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    onUpload?: (files: FileList) => void;
    isUploading?: boolean;
}

export default function ChatInput({ onSend, disabled, onUpload, isUploading }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    
    // Question suggestions
    const { suggestions, getSuggestions, isLoading: suggestionsLoading } = useQuestionSuggestions();
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.lang = 'en-IN'; // Indian English
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    // Append to existing text instead of replacing
                    setInput(prev => {
                        const separator = prev.trim() ? ' ' : '';
                        return prev + separator + transcript;
                    });
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'not-allowed') {
                        alert('Microphone access denied. Please allow microphone permissions.');
                    } else if (event.error === 'no-speech') {
                        alert('No speech detected. Please try again.');
                    }
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
                console.log('✅ Speech Recognition initialized');
            } catch (error) {
                console.error('Failed to initialize Speech Recognition:', error);
            }
        } else {
            console.warn('❌ Speech Recognition not available');
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore abort errors
                }
            }
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
                setFade(true);
            }, 300);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onUpload) {
            onUpload(e.target.files);
            // Reset input so the same files can't get stuck if selected again
            e.target.value = '';
        }
    };

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            // Check if it's a security issue (HTTP instead of HTTPS)
            if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
                alert('Voice input requires HTTPS for security. It works on localhost or HTTPS sites.');
            } else {
                alert('Voice input is not supported in your browser. Try Chrome, Edge, or Safari with HTTPS.');
            }
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                alert('Could not start voice input. Make sure microphone permissions are granted.');
                setIsListening(false);
            }
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [input]);

    return (
        <form className="chat-input" onSubmit={handleSubmit} id="chat-input-form">
            {/* Question Suggestions Dropdown */}
            {showSuggestions && (
                <QuestionSuggestions
                    suggestions={suggestions}
                    onSelect={(question) => {
                        setInput(question);
                        setShowSuggestions(false);
                        textareaRef.current?.focus();
                    }}
                    isLoading={suggestionsLoading}
                    inputValue={input}
                />
            )}
            
            <div className="chat-input__container">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    multiple
                    style={{ display: 'none' }}
                />

                <button
                    type="button"
                    className="chat-input__attach-btn"
                    title="Upload PDFs (Max 5)"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? <LoaderIcon /> : <PlusIcon />}
                </button>

                <textarea
                    ref={textareaRef}
                    className="chat-input__textarea"
                    placeholder="Ask me anything about your textbooks..."
                    value={input}
                    onChange={(e) => {
                        const value = e.target.value;
                        setInput(value);
                        // Get suggestions as user types
                        if (value.length >= 2) {
                            getSuggestions(value, 5);
                            setShowSuggestions(true);
                        } else {
                            setShowSuggestions(false);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (input.length >= 2) {
                            setShowSuggestions(true);
                        }
                    }}
                    disabled={disabled}
                    rows={1}
                    id="chat-input-textarea"
                />
                <div className="chat-input__actions">
                    <button
                        type="button"
                        className={`chat-input__mic-btn ${isListening ? 'listening' : ''}`}
                        title={isListening ? "Stop listening" : "Voice input (Speak in English)"}
                        id="mic-btn"
                        onClick={handleVoiceInput}
                        disabled={disabled}
                    >
                        <MicIcon />
                    </button>
                    <button
                        type="submit"
                        className="chat-input__send-btn"
                        disabled={!input.trim() || disabled}
                        id="send-btn"
                        title="Send message"
                    >
                        <PlayIcon />
                    </button>
                </div>
            </div>
            <p className="chat-input__disclaimer" style={{
                opacity: fade ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                minHeight: '1.2rem' // Keep height stable during transition
            }}>
                {TAGLINES[taglineIndex]}
            </p>
        </form>
    );
}
