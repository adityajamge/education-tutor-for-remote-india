import {
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Info,
} from 'lucide-react';

interface SidebarProps {
    onQuestionSelect: (question: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
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
                    {/* Empty content area ready for your instructions */}
                    <div className="sidebar__section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

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
                    {/* Ready for your instructions */}
                </div>
            )}
        </aside>
    );
}
