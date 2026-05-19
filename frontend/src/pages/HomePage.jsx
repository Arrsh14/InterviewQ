import { useNavigate } from 'react-router-dom';
import { Brain, ChevronRight, Zap, Shield, Target, Clock, Activity, Award } from 'lucide-react';

const features = [
  { icon: Brain, color: '#00E5FF', title: 'AI-Powered Questions', desc: 'Adaptive questions tailored to your skill level and role.' },
  { icon: Activity, color: '#7B61FF', title: 'Real-time Analysis', desc: 'Live feedback on your responses, tone, and confidence.' },
  { icon: Shield, color: '#00C98D', title: 'Privacy First', desc: 'All processing is local. Your data never leaves your device.' },
  { icon: Award, color: '#FFB547', title: 'Progress Tracking', desc: 'Detailed analytics to visualize your improvement over time.' },
];

const stats = [
  { value: '94%', label: 'Success Rate', color: '#00C98D' },
  { value: '10K+', label: 'Questions', color: '#00E5FF' },
  { value: '2.4x', label: 'Faster Prep', color: '#7B61FF' },
  { value: '50+', label: 'Domains', color: '#FFB547' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, rgba(123,97,255,0.05) 40%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(123,97,255,0.06) 0%, transparent 70%)' }}
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 fade-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
            style={{ background: 'rgba(0,229,255,0.06)', borderColor: 'rgba(0,229,255,0.2)' }}>
            <Zap size={12} className="text-accent" />
            <span className="text-xs font-mono text-accent tracking-wider">AI-POWERED INTERVIEW PLATFORM</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-display font-extrabold text-5xl sm:text-7xl tracking-tight mb-6 slide-up"
          style={{ animationDelay: '100ms', animationFillMode: 'both', lineHeight: 1.05 }}
        >
          Interview
          <span className="text-gradient-accent">IQ</span>
        </h1>

        <p
          className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-4 slide-up font-body"
          style={{ animationDelay: '200ms', animationFillMode: 'both', fontWeight: 300 }}
        >
          Practice with an AI interviewer that adapts to your responses.
          Get real-time feedback and land your dream job.
        </p>

        <p className="text-gray-600 text-sm font-mono mb-12 slide-up"
          style={{ animationDelay: '280ms', animationFillMode: 'both' }}>
          webcam · microphone · adaptive AI · instant scoring
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-up"
          style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
          <button
            onClick={() => navigate('/pre-interview')}
            className="btn-hex flex items-center gap-2 text-sm"
          >
            Start Interview
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 text-sm text-gray-400 hover:text-white border border-border hover:border-gray-500 rounded-sm transition-all duration-200 font-display font-medium tracking-wider uppercase"
          >
            View Dashboard
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ value, label, color }, i) => (
            <div
              key={label}
              className="card p-5 text-center relative overflow-hidden slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />
              <div className="font-display font-bold text-3xl mb-1" style={{ color }}>
                {value}
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Built for serious prep
          </h2>
          <p className="text-gray-500 text-sm font-mono">Everything you need to ace your next interview</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, color, title, desc }, i) => (
            <div
              key={title}
              className="card p-5 group hover:border-opacity-60 transition-all duration-300 slide-up cursor-default"
              style={{
                animationDelay: `${i * 80}ms`,
                animationFillMode: 'both',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 25px ${color}18`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              <div
                className="w-9 h-9 rounded-sm flex items-center justify-center mb-4"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon size={17} style={{ color }} />
              </div>
              <h3 className="font-display font-semibold text-sm text-white mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-body">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-3xl mx-auto px-4 mb-24 text-center">
        <div
          className="relative rounded-sm p-10 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(123,97,255,0.05))',
            border: '1px solid rgba(0,229,255,0.15)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.06) 0%, transparent 70%)' }} />
          <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-accent/40" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-accent/40" />

          <Clock size={32} className="text-accent mx-auto mb-4 opacity-60" />
          <h2 className="font-display font-bold text-2xl text-white mb-3">
            Ready in under a minute
          </h2>
          <p className="text-gray-400 text-sm mb-6 font-body">
            No account needed. Just allow camera access and start practicing immediately.
          </p>
          <button
            onClick={() => navigate('/pre-interview')}
            className="btn-hex text-sm"
          >
            Launch Interview Session
          </button>
        </div>
      </section>
    </div>
  );
}
