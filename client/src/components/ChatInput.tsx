import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';

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
                    {isUploading ? <Loader2 size={18} className="chat-input__spinner" /> : <Paperclip size={18} />}
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
