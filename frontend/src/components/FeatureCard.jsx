export default function FeatureCard({ icon, title, desc }) {
    return (
      <div className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-900/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.07)] cursor-default">
        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    );
  }