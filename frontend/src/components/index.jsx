// FeatureCard.jsx
export function FeatureCard({ icon, title, desc }) {
    return (
      <div className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.07)] cursor-default">
        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    );
  }
  
  // ScoreCard.jsx
  const colorMap = {
    cyan: "from-cyan-500 to-cyan-600",
    indigo: "from-indigo-500 to-indigo-600",
    violet: "from-violet-500 to-violet-600",
    emerald: "from-emerald-500 to-emerald-600",
  };
  const glowMap = {
    cyan: "hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]",
    indigo: "hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]",
    violet: "hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]",
    emerald: "hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]",
  };
  export function ScoreCard({ label, value, unit, delta, color }) {
    const isPositive = delta.startsWith("+") || delta.startsWith("−") && !delta.startsWith("−0");
    return (
      <div
        className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-5 transition-all duration-300 cursor-default ${glowMap[color]}`}
      >
        <p className="text-slate-500 text-xs uppercase tracking-widest font-mono mb-3">{label}</p>
        <div className="flex items-end gap-1 mb-2">
          <span className={`text-4xl font-black bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
            {value}
          </span>
          <span className="text-slate-500 text-sm mb-1">{unit}</span>
        </div>
        <span className="text-xs text-emerald-400 font-mono">{delta}</span>
      </div>
    );
  }
  
  // AttemptRow.jsx
  function scoreColor(s) {
    if (s >= 80) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (s >= 70) return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  }
  
  export function AttemptRow({ attempt }) {
    return (
      <div className="flex items-center gap-4 px-5 py-4 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200 cursor-pointer group">
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 ${scoreColor(attempt.score)}`}>
          {attempt.score}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-200 text-sm truncate group-hover:text-white transition-colors">
            {attempt.role}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-500 text-xs">{attempt.date}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 text-xs">⏱ {attempt.duration}</span>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          {attempt.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded-lg font-mono">
              {t}
            </span>
          ))}
        </div>
        <button className="text-slate-600 hover:text-cyan-400 text-sm transition-colors shrink-0 ml-2">
          View →
        </button>
      </div>
    );
  }