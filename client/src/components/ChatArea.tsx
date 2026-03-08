import { useRef, useEffect } from 'react';
import { User, GraduationCap, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatAreaProps {
    messages: Message[];
}

function MessageBubble({ message }: { message: Message }) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
            <div className={`chat-message__avatar ${isUser ? 'chat-message__avatar--user' : 'chat-message__avatar--assistant'}`}>
                {isUser ? <User size={16} /> : <GraduationCap size={16} />}
            </div>
            <div className="chat-message__content-wrapper">
                <div className={`chat-message__bubble ${isUser ? 'chat-message__bubble--user' : 'chat-message__bubble--assistant'}`}>
                    {isUser ? (
                        <p className="chat-message__text">{message.content}</p>
                    ) : (
                        <div className="chat-message__markdown">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    )}
                </div>
                <div className="chat-message__meta">
                    <span className="chat-message__time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                        <button className="chat-message__copy" onClick={handleCopy} title="Copy response">
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="chat-message chat-message--assistant">
            <div className="chat-message__avatar chat-message__avatar--assistant">
                <GraduationCap size={16} />
            </div>
            <div className="chat-message__content-wrapper">
                <div className="chat-message__bubble chat-message__bubble--assistant">
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChatArea({ messages }: ChatAreaProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-area" id="chat-area">
            <div className="chat-area__messages">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
