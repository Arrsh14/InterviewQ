import { useState } from 'react';
import { Lightbulb, ChevronDown, Tag, BarChart2 } from 'lucide-react';
import { getDifficultyColor, getCategoryColor } from '../utils/helpers';

export default function QuestionBox({ question, questionNumber, total }) {
  const [showHint, setShowHint] = useState(false);

  if (!question) return null;

  return (
    <div className="card p-6 relative overflow-hidden slide-up">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${getCategoryColor(question.category)}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag">
            <Tag size={9} />
            {question.category}
          </span>
          <span
            className="tag"
            style={{
              borderColor: `${getDifficultyColor(question.difficulty)}33`,
              background: `${getDifficultyColor(question.difficulty)}12`,
              color: getDifficultyColor(question.difficulty),
            }}
          >
            <BarChart2 size={9} />
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-mono text-gray-500">Q</span>
          <span className="text-sm font-display font-bold text-white">{questionNumber}</span>
          <span className="text-xs font-mono text-gray-600">/ {total}</span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-white leading-relaxed text-base font-body mb-5" style={{ fontWeight: 400 }}>
        {question.question}
      </p>

      {/* Hint toggle */}
      {question.hint && (
        <div className="mt-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-xs font-mono text-yellow-500/70 hover:text-yellow-400 transition-colors group"
          >
            <Lightbulb size={13} className="group-hover:text-yellow-400" />
            {showHint ? 'Hide hint' : 'Show hint'}
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${showHint ? 'rotate-180' : ''}`}
            />
          </button>
          {showHint && (
            <div
              className="mt-3 px-4 py-3 rounded-sm text-xs font-body text-yellow-300/80 fade-in"
              style={{ background: 'rgba(255,181,71,0.07)', border: '1px solid rgba(255,181,71,0.15)' }}
            >
              💡 {question.hint}
            </div>
          )}
        </div>
      )}

      {/* Bottom decoration */}
      <div className="absolute bottom-2 right-3 flex gap-1 opacity-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-accent" style={{ opacity: (i + 1) * 0.25 }} />
        ))}
      </div>
    </div>
  );
}
