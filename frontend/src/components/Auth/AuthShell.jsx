import { Link } from "react-router-dom";
import Aurora from "../../bits/Aurora/Aurora";
import BlurText from "../../bits/BlurText/BlurText";
import ShinyText from "../../bits/ShinyText/ShinyText";

const AuthShell = ({ title, subtitle, children, footerLinks = [] }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden bg-slate-950">
      {/* Aurora background */}
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#1e1b4b", "#4f46e5", "#0c4a6e"]} amplitude={1.2} blend={0.6} speed={0.8} />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0 bg-slate-950/60" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
          <div className="text-center">
            <BlurText text={title} className="text-2xl font-bold text-white justify-center" delay={60} />
            {subtitle && <ShinyText text={subtitle} className="mt-1 text-sm" color="#64748b" shineColor="#94a3b8" speed={4} />}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {children}
        </div>

        {/* Footer links */}
        {footerLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.to} className="text-indigo-400 transition-colors hover:text-indigo-300" to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthShell;
