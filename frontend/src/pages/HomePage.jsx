import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.58;
      const t = frame * 0.018;
      const pulse = Math.sin(t) * 0.1 + 1;

      // Outer violet halo
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380 * pulse);
      g1.addColorStop(0, 'rgba(100, 50, 255, 0.18)');
      g1.addColorStop(0.4, 'rgba(80, 30, 200, 0.10)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1;
      ctx.beginPath(); ctx.arc(cx, cy, 380 * pulse, 0, Math.PI * 2); ctx.fill();

      // Mid bright glow
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 * pulse);
      g2.addColorStop(0, 'rgba(160, 100, 255, 0.45)');
      g2.addColorStop(0.3, 'rgba(120, 60, 255, 0.30)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(cx, cy, 180 * pulse, 0, Math.PI * 2); ctx.fill();

      // Bright white-violet core
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * pulse);
      g3.addColorStop(0, 'rgba(240, 210, 255, 1)');
      g3.addColorStop(0.25, 'rgba(190, 130, 255, 0.9)');
      g3.addColorStop(0.6, 'rgba(120, 60, 255, 0.5)');
      g3.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g3;
      ctx.beginPath(); ctx.arc(cx, cy, 70 * pulse, 0, Math.PI * 2); ctx.fill();

      // Arc rings (bottom half only)
      for (let i = 0; i < 4; i++) {
        const r = (110 + i * 60) * pulse;
        const alpha = (0.35 - i * 0.07) * (Math.sin(t + i * 0.5) * 0.15 + 1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI * 1.08, Math.PI * 1.92);
        ctx.strokeStyle = `rgba(180, 120, 255, ${alpha})`;
        ctx.lineWidth = 1.5 - i * 0.25;
        ctx.stroke();
      }

      // Ground glow spread
      const g4 = ctx.createRadialGradient(cx, cy + 20, 0, cx, cy + 20, 300);
      g4.addColorStop(0, 'rgba(140, 80, 255, 0.22)');
      g4.addColorStop(0.5, 'rgba(80, 30, 180, 0.08)');
      g4.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g4;
      ctx.fillRect(cx - 300, cy - 20, 600, 200);

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e0b1f',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#fff',
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { opacity: 0; animation: fadeUp 0.75s ease forwards; }

        .rfl-nav-link {
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          padding: 4px 2px;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: inherit;
        }
        .rfl-nav-link:hover { color: #fff; }

        .rfl-btn-primary {
          background: #6c3fff;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, transform 0.15s;
        }
        .rfl-btn-primary:hover { background: #7d52ff; transform: translateY(-1px); }

        .rfl-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s, background 0.2s;
        }
        .rfl-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.06); }

        .rfl-cta-primary {
          background: #fff;
          color: #0e0b1f;
          border: none;
          border-radius: 8px;
          padding: 13px 26px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, transform 0.15s;
        }
        .rfl-cta-primary:hover { background: #ede8ff; transform: translateY(-1px); }

        .rfl-cta-ghost {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 13px 26px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, border-color 0.2s;
        }
        .rfl-cta-ghost:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); }

        .app-frame {
          background: rgba(16, 12, 36, 0.88);
          border: 1px solid rgba(255,255,255,0.1);
          border-bottom: none;
          border-radius: 14px 14px 0 0;
          overflow: hidden;
          backdrop-filter: blur(24px);
          box-shadow: 0 -20px 80px rgba(100, 50, 255, 0.15), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .app-titlebar {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          gap: 8px;
        }
        .dot { width: 11px; height: 11px; border-radius: 50%; }
        .sidebar-item {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 6px;
          font-size: 13px; color: rgba(255,255,255,0.4);
          cursor: default; transition: background 0.15s;
        }
        .sidebar-item.active { background: rgba(120,60,255,0.2); color: #fff; }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(14,11,31,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7b3fff, #4a1fcc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🧠</div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>InterviewQ</span>
        </div>

        {/* Center links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '4px 8px',
        }}>
          {['Product', 'Pricing', 'Company', 'Blog', 'Changelog'].map(l => (
            <button key={l} className="rfl-nav-link" style={{ padding: '5px 14px', borderRadius: 999 }}>{l}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="rfl-btn-ghost">Login</button>
          <button className="rfl-btn-primary" onClick={() => navigate('/pre-interview')}>Start free trial</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '90px 24px 0', overflow: 'hidden' }}>

        {/* Orb canvas */}
        <canvas ref={canvasRef} style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 900, height: 580,
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="fu" style={{ animationDelay: '0ms', marginBottom: 28 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              fontSize: 13, color: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
            }}>
              <Sparkles size={13} color="#c0a0ff" />
              New: Our AI integration just landed
            </span>
          </div>

          {/* Headline */}
          <h1 className="fu" style={{
            animationDelay: '100ms',
            fontSize: 'clamp(48px, 7.5vw, 88px)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.04,
            margin: '0 auto 22px',
            maxWidth: 820,
          }}>
            Ace your next interview<br />with AI precision.
          </h1>

          {/* Sub */}
          <p className="fu" style={{
            animationDelay: '200ms',
            fontSize: 17, color: 'rgba(255,255,255,0.5)',
            fontWeight: 400, lineHeight: 1.65,
            maxWidth: 440, margin: '0 auto 40px',
          }}>
            Never miss a gap, weakness, or opportunity. InterviewQ gives you real-time feedback that actually moves the needle.
          </p>

          {/* CTAs */}
          <div className="fu" style={{
            animationDelay: '300ms',
            display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 72,
          }}>
            <button className="rfl-cta-primary" onClick={() => navigate('/pre-interview')}>
              Start for free →
            </button>
            <button className="rfl-cta-ghost" onClick={() => navigate('/dashboard')}>
              View demo
            </button>
          </div>

          {/* App screenshot */}
          <div className="fu" style={{ animationDelay: '450ms', maxWidth: 900, margin: '0 auto' }}>
            <div className="app-frame">
              {/* Titlebar */}
              <div className="app-titlebar">
                <div className="dot" style={{ background: '#ff5f57' }} />
                <div className="dot" style={{ background: '#febc2e' }} />
                <div className="dot" style={{ background: '#28c840' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: 6,
                    padding: '3px 16px', fontSize: 11, color: 'rgba(255,255,255,0.25)',
                  }}>
                    interviewiq.app — Practice Session
                  </div>
                </div>
                {/* Search */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.05)', borderRadius: 6,
                  padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)',
                }}>
                  🔍 Search anything... <span style={{ opacity: 0.4, fontSize: 10 }}>⌘K</span>
                </div>
              </div>

              {/* App body */}
              <div style={{ display: 'flex', height: 320 }}>
                {/* Sidebar */}
                <div style={{
                  width: 190, borderRight: '1px solid rgba(255,255,255,0.06)',
                  padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  {[
                    { icon: '📋', label: 'Daily notes', active: true },
                    { icon: '📄', label: 'All notes' },
                    { icon: '✅', label: 'Tasks' },
                    { icon: '🗺️', label: 'Map' },
                  ].map(({ icon, label, active }) => (
                    <div key={label} className={`sidebar-item${active ? ' active' : ''}`}>
                      <span>{icon}</span> {label}
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: '0 10px', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Pinned notes
                  </div>
                </div>

                {/* Main */}
                <div style={{ flex: 1, padding: '20px 28px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <div style={{ width: 3, height: 18, background: '#7b3fff', borderRadius: 2 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                      Sun, April 2nd, 2023
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>
                    <div>• Today I started using <span style={{ color: '#9b77ff' }}>InterviewQ</span></div>
                    <div style={{ marginLeft: 16, marginTop: 6 }}>
                      <div>• What is InterviewQ?</div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: 'rgba(255,255,255,0.4)' }}>
                        • A practice tool designed to mirror real interviews
                      </div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: 'rgba(255,255,255,0.4)' }}>
                        • It adapts questions based on your responses and skill level
                      </div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: 'rgba(255,255,255,0.4)' }}>
                        • Over time, you build confidence. InterviewQ becomes an extension of your prep...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div style={{ width: 240, padding: '20px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>April 2023</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['‹', '□', '›'].map(c => (
                        <span key={c} style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 11, textAlign: 'center' }}>
                    {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                      <div key={d} style={{ color: 'rgba(255,255,255,0.3)', padding: '4px 0', fontWeight: 500 }}>{d}</div>
                    ))}
                    {[27,28,29,30,31,'',2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d, i) => (
                      <div key={i} style={{
                        padding: '5px 0', borderRadius: 4, fontSize: 11,
                        color: d === 2 ? '#fff' : d === '' || d < 3 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
                        background: d === 2 ? '#6c3fff' : 'transparent',
                        cursor: d ? 'pointer' : 'default',
                      }}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}