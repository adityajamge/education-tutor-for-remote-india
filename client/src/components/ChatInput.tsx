import { useState, useRef, useEffect, type FormEvent } from 'react';

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

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [input]);

    return (
        <form className="chat-input" onSubmit={handleSubmit} id="chat-input-form">
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
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                    id="chat-input-textarea"
                />
                <div className="chat-input__actions">
                    <button
                        type="button"
                        className="chat-input__mic-btn"
                        title="Voice input (coming soon)"
                        id="mic-btn"
                        disabled
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
