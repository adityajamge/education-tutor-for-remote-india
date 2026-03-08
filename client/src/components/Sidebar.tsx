import {
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Info,
    FileText,
    FileX,
    Trash2,
} from 'lucide-react';
import type { Document } from '../hooks/useDocuments';

interface SidebarProps {
    onQuestionSelect: (question: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    documents?: Document[];
    onRemove?: (id: string) => void;
    onClearSession?: () => void;
    error?: string | null;
}

export default function Sidebar({ collapsed, onToggleCollapse, documents = [], onRemove, onClearSession, error }: SidebarProps) {
    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Collapse toggle */}
            <button
                className="sidebar__toggle"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                id="sidebar-toggle"
            >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Brand / Logo */}
            <div className="sidebar__brand">
                <div className="sidebar__logo">
                    <GraduationCap size={collapsed ? 24 : 28} />
                </div>
                {!collapsed && (
                    <div className="sidebar__brand-text">
                        <h1 className="sidebar__title">EduTutor</h1>
                        <span className="sidebar__subtitle">AI Learning Assistant</span>
                    </div>
                )}
            </div>

            {!collapsed && (
                <>
                    {/* Documents List */}
                    <div className="sidebar__section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="sidebar__section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileText size={14} />
                                <span>Attached Textbooks</span>
                            </div>
                            {documents.length > 0 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
                                    {documents.length} / 5
                                </span>
                            )}
                        </h2>

                        <div className="sidebar__pdfs" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                            {documents.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '24px 0',
                                    color: 'var(--text-tertiary)',
                                    textAlign: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--accent-primary)'
                                    }}>
                                        <FileX size={20} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem' }}>No PDF files uploaded yet</p>
                                </div>
                            ) : (
                                documents.map((doc) => (
                                    <div key={doc.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-primary)',
                                    }}>
                                        <FileText size={16} color="var(--accent-primary)" />
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={doc.fileName}>
                                                {doc.fileName}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                {doc.pageCount} pages
                                            </span>
                                        </div>
                                        {onRemove && (
                                            <button
                                                onClick={() => onRemove(doc.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-tertiary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    padding: '4px',
                                                    borderRadius: '4px'
                                                }}
                                                title="Remove PDF"
                                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-danger)'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {error && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px',
                                background: 'rgba(255, 107, 107, 0.1)',
                                color: 'var(--accent-danger)',
                                fontSize: '0.75rem',
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                {error}
                            </div>
                        )}

                        {documents.length > 0 && onClearSession && (
                            <button
                                onClick={onClearSession}
                                style={{
                                    marginTop: 'auto',
                                    marginBottom: '16px',
                                    padding: '8px 0',
                                    background: 'transparent',
                                    border: '1px solid var(--border-secondary)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Trash2 size={14} />
                                <span>Clear Session</span>
                            </button>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="sidebar__footer">
                        <div className="sidebar__info-card">
                            <Info size={14} />
                            <p>Powered by AI with context compression for low-bandwidth areas.</p>
                        </div>
                        <p className="sidebar__credits">
                            Intel Unnati × HPE
                        </p>
                    </div>
                </>
            )}

            {collapsed && (
                <div className="sidebar__collapsed-icons">
                    {/* Collapsed view icons if needed */}
                    {documents.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }} title={`Attached Textbooks: ${documents.length}/5`}>
                            <FileText size={20} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{documents.length}</span>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
