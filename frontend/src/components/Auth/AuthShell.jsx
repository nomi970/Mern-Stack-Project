import { Link } from "react-router-dom";

const AuthShell = ({ title, subtitle, children, footerLinks = [] }) => {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-400/30">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>

          {/* Content */}
          <div>{children}</div>

          {/* Footer links */}
          {footerLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              {footerLinks.map((link) => (
                <Link key={link.to} className="text-blue-400 hover:text-blue-300 transition-colors" to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
