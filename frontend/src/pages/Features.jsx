import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Features() {
  const navigate = useNavigate();

  const features = [
    { icon: "ti-microphone", title: "Speech acoustics analysis", desc: "Measures pace, filler word usage, tone modulation, and clarity in real time as you speak.", tag: "Audio AI" },
    { icon: "ti-eye", title: "Facial behaviour tracking", desc: "Detects eye contact, confidence expressions, and nervous gestures using computer vision.", tag: "Computer Vision" },
    { icon: "ti-brain", title: "NLP signal processing", desc: "Evaluates answer relevance, structure, keyword coverage, and sentiment in your responses.", tag: "NLP" },
    { icon: "ti-chart-bar", title: "Unified performance index", desc: "All signals fused into one composite score with a detailed breakdown by dimension.", tag: "Scoring" },
    { icon: "ti-message-dots", title: "AI question generation", desc: "Generates role-specific questions tailored to your target job, level, and tech stack.", tag: "Generative AI" },
    { icon: "ti-report-analytics", title: "Post-interview analytics", desc: "Session history, score trends over time, and actionable improvement suggestions.", tag: "Analytics" },
  ];

  const stats = [
    { num: "3", label: "Modalities analysed" },
    { num: "<200ms", label: "Feedback latency" },
    { num: "50+", label: "Question categories" },
    { num: "100%", label: "Private & local" },
  ];

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <Navbar />
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 border border-cyan-800 text-cyan-400 text-xs tracking-widest px-4 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CORE CAPABILITIES
          </span>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Everything you need to <span className="text-cyan-400">ace your next interview</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            InterviewQ combines multimodal AI signals — speech, facial cues, and language — into one unified performance score.
          </p>
        </div>

        {/* Features Grid */}
        <p className="text-center text-xs text-cyan-600 tracking-widest uppercase mb-3">Analysis</p>
        <p className="text-center text-xl font-medium text-slate-100 mb-10">Real-time multimodal intelligence</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((f) => (
            <div key={f.title} className="bg-[#0d1117] border border-[#1e2d40] hover:border-cyan-800 rounded-2xl p-6 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-[#0c2233] border border-[#0e4a6e] flex items-center justify-center mb-4">
                <i className={`ti ${f.icon} text-cyan-400 text-xl`} />
              </div>
              <h3 className="text-sm font-medium text-slate-100 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              <span className="inline-block mt-3 text-[11px] text-cyan-600 bg-[#0c2233] border border-[#0e4a6e] rounded-full px-3 py-0.5">{f.tag}</span>
            </div>
          ))}
        </div>

        <hr className="border-[#1e2d40] mb-12" />

        {/* Stats */}
        <p className="text-center text-xs text-cyan-600 tracking-widest uppercase mb-3">By the numbers</p>
        <p className="text-center text-xl font-medium text-slate-100 mb-10">Built for performance</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0d1117] border border-[#1e2d40] rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400">{s.num}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate("/auth")}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-8 py-3 rounded-xl transition-all"
          >
            Start practising →
          </button>
        </div>
      </div>
    </div>
  );
}