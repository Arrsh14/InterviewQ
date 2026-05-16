import Navbar from "../components/Navbar";

export default function Docs() {
    const steps = [
        { title: "Create an account", desc: "Sign up with your email. Your session data is tied to your account so you can track progress over time." },
        { title: "Start an interview", desc: 'Click "Start Interview" from the dashboard. Allow camera and microphone access when prompted.' },
        { title: "Answer the questions", desc: "AI-generated questions appear one at a time. Speak naturally — InterviewQ analyses you in real time." },
        { title: "Review your results", desc: "After the session, get a detailed score breakdown across speech, body language, and answer quality." },
        { title: "Track improvement", desc: "Visit the Analytics tab to see how your scores change across sessions over time." },
    ];
    const stack = [
        { icon: "ti-brand-react", name: "React + Vite", role: "Frontend" },
        { icon: "ti-server", name: "Node + Express", role: "Backend API" },
        { icon: "ti-database", name: "MongoDB Atlas", role: "Database" },
        { icon: "ti-brain", name: "Gemini API", role: "AI / NLP" },
        { icon: "ti-video", name: "WebRTC", role: "Camera / Mic" },
        { icon: "ti-mail", name: "Nodemailer", role: "Email / OTP" },
    ];
    return (
        <div className="min-h-screen bg-[#060810] text-white">
            <Navbar />
            <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 border border-cyan-800 text-cyan-400 text-xs tracking-widest px-4 py-1 rounded-full mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> DOCS
                    </span>
                    <h1 className="text-4xl font-bold mb-4">Get up and running <span className="text-cyan-400">in minutes</span></h1>
                    <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">Everything you need to use InterviewQ — from your first session to understanding your scores.</p>
                </div>

                <p className="text-xs text-cyan-600 tracking-widest uppercase mb-2">User guide</p>
                <p className="text-xl font-medium text-slate-100 mb-8">How to run a practice interview</p>
                <div className="flex flex-col gap-4 mb-12">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex gap-4 items-start bg-[#0d1117] border border-[#1e2d40] rounded-2xl p-5">
                            <div className="min-w-[32px] h-8 rounded-full bg-[#0c2233] border border-[#0e4a6e] flex items-center justify-center text-cyan-400 text-sm font-bold">{i + 1}</div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-100 mb-1">{s.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="border-[#1e2d40] mb-10" />

                <p className="text-xs text-cyan-600 tracking-widest uppercase mb-2">Tech stack</p>
                <p className="text-xl font-medium text-slate-100 mb-8">How it's built</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
                    {stack.map((t) => (
                        <div key={t.name} className="bg-[#0d1117] border border-[#1e2d40] rounded-xl p-4 flex flex-col gap-2">
                            <i className={`ti ${t.icon} text-cyan-400 text-xl`} />
                            <p className="text-xs font-medium text-slate-100">{t.name}</p>
                            <span className="text-[11px] text-slate-500">{t.role}</span>
                        </div>
                    ))}
                </div>

                <hr className="border-[#1e2d40] mb-10" />

                <p className="text-xs text-cyan-600 tracking-widest uppercase mb-2">Run locally</p>
                <p className="text-xl font-medium text-slate-100 mb-6">Set up the project on your machine</p>
                <pre className="bg-[#0d1117] border border-[#1e2d40] rounded-xl p-5 text-sm text-cyan-400 overflow-x-auto mb-4">{`# Clone the repo
git clone https://github.com/Arrsh14/InterviewQ

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install

# Start both
npm run dev`}</pre>
                <pre className="bg-[#0d1117] border border-[#1e2d40] rounded-xl p-5 text-sm text-cyan-400 overflow-x-auto">{`# Required .env variables (backend)
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_key`}</pre>
            </div>
        </div>
    );
}