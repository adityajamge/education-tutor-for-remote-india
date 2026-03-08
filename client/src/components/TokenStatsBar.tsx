import { Zap, BarChart3 } from 'lucide-react';

interface TokenStats {
    originalTokens: number;
    compressedTokens: number;
    savings: number;
}

interface TokenStatsBarProps {
    stats: TokenStats | null;
}

export default function TokenStatsBar({ stats }: TokenStatsBarProps) {
    if (!stats) return null;

    return (
        <div className="token-stats" id="token-stats">
            <div className="token-stats__item">
                <BarChart3 size={14} />
                <span>Original: <strong>{stats.originalTokens}</strong> tokens</span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item">
                <Zap size={14} />
                <span>Compressed: <strong>{stats.compressedTokens}</strong> tokens</span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item token-stats__item--savings">
                <span>Saved: <strong>{stats.savings}%</strong></span>
            </div>
        </div>
    );
}
