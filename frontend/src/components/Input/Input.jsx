import { forwardRef, useState } from "react";

const Input = forwardRef(({ label, error, type = "text", icon, ...rest }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField ? (isPasswordVisible ? "text" : "password") : type;

  const inputCls = [
    "w-full rounded-xl border bg-slate-900/60 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all",
    "focus:border-indigo-500/70 focus:bg-slate-900/80 focus:ring-2 focus:ring-indigo-500/25",
    error ? "border-red-500/60" : "border-white/10",
    icon ? "pl-10 pr-4" : "px-4",
    isPasswordField ? "pr-11" : ""
  ].join(" ");

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
            {icon}
          </span>
        )}
        <input ref={ref} type={resolvedType} className={inputCls} {...rest} />
        {isPasswordField && (
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            onClick={() => setIsPasswordVisible((p) => !p)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition-colors hover:text-slate-300"
          >
            {isPasswordVisible ? (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 102.8 2.8M9.4 5.3A10.9 10.9 0 0112 5c5.6 0 9.6 4.4 10 7-.2 1.3-1.3 3-3 4.5M6.6 6.6C4.3 8.2 2.5 10.3 2 12c.4 2.6 4.4 7 10 7 1.4 0 2.7-.3 3.9-.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.8">
                <path d="M2 12c.4-2.6 4.4-7 10-7s9.6 4.4 10 7c-.4 2.6-4.4 7-10 7s-9.6-4.4-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
