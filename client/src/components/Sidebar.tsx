import {
    FileText,
    FileX,
    Trash2,
    Eye,
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
            {/* Brand / Toggle Header */}
            <div className={`sidebar__brand ${collapsed ? 'sidebar__brand--collapsed' : ''}`}>
                <button
                    onClick={onToggleCollapse}
                    className="sidebar__header-btn"
                    title={collapsed ? "Expand Your Library" : "Collapse Your Library"}
                >
                    <div className="sidebar__header-icon">
                        <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width={collapsed ? 24 : 24} height={collapsed ? 24 : 24}>
                            <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"></path>
                        </svg>
                    </div>
                    {!collapsed && <span className="sidebar__title">EduTutor</span>}
                </button>
            </div>

            {!collapsed && (
                <>
                    {/* Documents List */}
                    <div className="sidebar__section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h2 className="sidebar__section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 20px', margin: '-16px -12px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                <FileText size={24} />
                                <span>Attached Textbooks</span>
                            </div>
                            {documents.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>
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
                                    <div key={doc.id} className="sidebar-doc-item" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--bg-elevated)',
                                            borderRadius: '4px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, gap: '2px' }}>
                                            <span style={{
                                                fontSize: '0.88rem',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }} title={doc.fileName}>
                                                {doc.fileName}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {doc.pageCount} pages
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <button
                                                className="sidebar-doc-action"
                                                title="View PDF"
                                                onClick={() => {
                                                    alert(`Viewing ${doc.fileName} is not implemented yet.`);
                                                }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {onRemove && (
                                                <button
                                                    onClick={() => onRemove(doc.id)}
                                                    className="sidebar-doc-action"
                                                    title="Remove PDF"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
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
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    borderRadius: '500px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all var(--transition-fast)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Clear Session</span>
                            </button>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="sidebar__footer" style={{ marginTop: 'auto', padding: '16px 8px' }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '16px',
                            borderRadius: '8px',
                            background: 'var(--bg-elevated)',
                            alignItems: 'flex-start'
                        }}>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', margin: 0 }}>Powered by AI</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', letterSpacing: '0px', margin: 0 }}>Context compression for low-bandwidth regions.</p>
                            <button style={{
                                background: 'var(--text-primary)',
                                color: 'var(--bg-primary)',
                                borderRadius: '500px',
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                border: 'none',
                                marginTop: '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.1s ease',
                            }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Learn more
                            </button>
                        </div>
                        <div style={{ padding: '32px 16px 16px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Intel Unnati</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>× HPE</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>EduTutor 2026</span>
                        </div>
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
