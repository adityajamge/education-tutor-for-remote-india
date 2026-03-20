import { Zap, BarChart3 } from 'lucide-react';

interface TokenStats {
    baselineTokens: number;
    optimizedTokens: number;
    compressedTokens: number;
    routingSavings: number;
    totalSavings: number;
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
                <span>Baseline: <strong>{stats.baselineTokens}</strong></span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item">
                <Zap size={14} />
                <span>Routed: <strong>{stats.optimizedTokens}</strong></span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item token-stats__item--savings">
                <span>Compress: <strong>{stats.compressedTokens}</strong></span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item token-stats__item--savings">
                <span>Route Save: <strong>{stats.routingSavings}%</strong></span>
            </div>
            <div className="token-stats__divider" />
            <div className="token-stats__item token-stats__item--savings">
                <span>Total Save: <strong>{stats.totalSavings}%</strong></span>
            </div>
        </div>
    );
}
