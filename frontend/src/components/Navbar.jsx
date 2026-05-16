import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const links = [
    { label: "Features", path: "/features" },
    { label: "Research", path: "/research" },
    { label: "Docs", path: "/docs" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-[#060810]/80 backdrop-blur-md border-b border-slate-800/60">
      <button onClick={() => navigate("/")} className="text-xl font-black text-white">
        Interview<span className="text-cyan-400">Q</span>
      </button>
      <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => navigate(l.path)}
            className="hover:text-white transition-colors"
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/auth")}
          className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/auth")}
          className="text-sm px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}