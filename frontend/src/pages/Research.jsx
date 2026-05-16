import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Research() {
  const problems = [
    { num: "78%", title: "Rejected despite preparation", desc: "Most candidates who fail interviews report having studied the material — the gap is in delivery, not knowledge." },
    { num: "0", title: "Real-time feedback tools", desc: "No existing tool analyses speech, body language, and language together in real time during a mock interview." },
    { num: "3x", title: "Higher success with coaching", desc: "Candidates with access to a human coach are 3x more likely to pass — but coaching costs hundreds of dollars per session." },
  ];
  const why = [
    { icon: "ti-accessible", title: "Democratises coaching", desc: "AI-powered feedback previously only available through expensive human coaches." },
    { icon: "ti-activity", title: "Multimodal signals", desc: "Unlike text-only tools, InterviewQ reads speech, face, and language simultaneously." },
    { icon: "ti-lock", title: "Private by design", desc: "All processing happens locally. Your sessions are never stored or shared." },
    { icon: "ti-trending-up", title: "Measurable improvement", desc: "Track your score across sessions and see exactly which dimensions are improving." },
  ];
  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <Navbar />
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 border border-cyan-800 text-cyan-400 text-xs tracking-widest px-4 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> RESEARCH
          </span>
          <h1 className="text-4xl font-bold leading-tight mb-4">The interview problem <span className="text-cyan-400">no one is solving</span></h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">Traditional interview prep is broken. Candidates rehearse in isolation with no real feedback on how they actually come across.</p>
        </div>

        <p className="text-xs text-cyan-600 tracking-widest uppercase mb-2">The problem</p>
        <p className="text-xl font-medium text-slate-100 mb-8">Why candidates fail — even when they know the answers</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {problems.map((p) => (
            <div key={p.title} className="bg-[#0d1117] border border-[#1e2d40] rounded-2xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{p.num}</div>
              <h3 className="text-sm font-medium text-slate-100 mb-2">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0d1117] border-l-4 border-cyan-500 rounded-r-2xl px-6 py-5 mb-10">
          <p className="text-slate-400 italic leading-relaxed">"I knew every answer but froze under pressure. No one ever told me I spoke too fast or avoided eye contact."</p>
          <span className="text-xs text-slate-600 mt-2 block">— Common candidate experience, motivating InterviewQ</span>
        </div>

        <hr className="border-[#1e2d40] mb-10" />

        <p className="text-xs text-cyan-600 tracking-widest uppercase mb-2">Why InterviewQ</p>
        <p className="text-xl font-medium text-slate-100 mb-8">Making elite preparation accessible to everyone</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {why.map((w) => (
            <div key={w.title} className="bg-[#0d1117] border border-[#1e2d40] rounded-2xl p-5">
              <i className={`ti ${w.icon} text-cyan-400 text-xl mb-3 block`} />
              <h3 className="text-sm font-medium text-slate-100 mb-2">{w.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}