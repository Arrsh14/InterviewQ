import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const typeConfig = {
  strength: {
    icon: TrendingUp,
    color: '#00C98D',
    label: 'Strength',
    bg: 'rgba(0,201,141,0.07)',
    border: 'rgba(0,201,141,0.2)',
  },
  improvement: {
    icon: TrendingDown,
    color: '#FF4D6D',
    label: 'Improve',
    bg: 'rgba(255,77,109,0.07)',
    border: 'rgba(255,77,109,0.2)',
  },
  tip: {
    icon: Zap,
    color: '#00E5FF',
    label: 'AI Tip',
    bg: 'rgba(0,229,255,0.07)',
    border: 'rgba(0,229,255,0.2)',
  },
};

export default function FeedbackCard({ item, index = 0 }) {
  const config = typeConfig[item.type] || typeConfig.tip;
  const Icon = config.icon;

  return (
    <div
      className="relative rounded-sm p-5 overflow-hidden slide-up"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Top line */}
      <div
        className="absolute top-0 left-0 w-12 h-px"
        style={{ background: config.color }}
      />

      <div className="flex items-start gap-3">
        <div
          className="p-1.5 rounded-sm shrink-0 mt-0.5"
          style={{ background: `${config.color}18`, border: `1px solid ${config.color}33` }}
        >
          <Icon size={13} style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-500 font-mono">{item.session}</span>
            {item.score !== null && item.score !== undefined && (
              <>
                <span className="text-gray-600 text-xs">·</span>
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: config.color }}
                >
                  {item.score}%
                </span>
              </>
            )}
          </div>

          <h4 className="text-sm font-display font-semibold text-white mb-1.5">
            {item.title}
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed font-body">
            {item.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
