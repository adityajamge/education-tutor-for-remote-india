import { useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

const UserIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.239 2 7 4.239 7 7s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5zm0 12c-4.418 0-8 2.686-8 6v2h16v-2c0-3.314-3.582-6-8-6z" />
    </svg>
);

const AILogoIcon = ({ size = 20 }) => (
    <svg role="img" height={size} width={size} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
    </svg>
);
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
                {isUser ? <UserIcon size={18} /> : <AILogoIcon size={20} />}
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
                <AILogoIcon size={20} />
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
