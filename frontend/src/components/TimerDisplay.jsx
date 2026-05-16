import { formatTime } from '../utils/helpers';
import { Clock } from 'lucide-react';

export default function TimerDisplay({ timeLeft, total, isExpired }) {
  const progress = timeLeft / total;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const color = isExpired
    ? '#FF4D6D'
    : progress > 0.5 ? '#00C98D'
    : progress > 0.25 ? '#FFB547'
    : '#FF4D6D';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-lg font-mono font-bold leading-none ${isExpired ? 'animate-pulse' : ''}`}
            style={{ color }}
          >
            {formatTime(timeLeft)}
          </span>
          <span className="text-gray-600 text-xs font-mono mt-0.5">TIME</span>
        </div>
      </div>

      {/* Urgency label */}
      {!isExpired && progress <= 0.25 && (
        <div className="text-xs font-mono text-danger animate-pulse">⚠ Running out</div>
      )}
      {isExpired && (
        <div className="text-xs font-mono text-danger">Time's up!</div>
      )}
    </div>
  );
}
