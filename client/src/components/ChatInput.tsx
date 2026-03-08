import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                        <Mic size={18} />
                    </button>
                    <button
                        type="submit"
                        className="chat-input__send-btn"
                        disabled={!input.trim() || disabled}
                        id="send-btn"
                        title="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            <p className="chat-input__disclaimer">
                EduTutor uses AI to generate answers. Always verify with your textbook.
            </p>
        </form>
    );
}
