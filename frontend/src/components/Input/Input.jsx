import { forwardRef, useState } from "react";

const Input = forwardRef(({ label, error, type = "text", ...rest }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={resolvedType}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500/60 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20"
          {...rest}
        />
        {isPasswordField && (
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-200"
          >
            {isPasswordVisible ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 102.8 2.8" />
                <path d="M9.4 5.3A10.9 10.9 0 0112 5c5.6 0 9.6 4.4 10 7-.2 1.3-1.3 3-3 4.5" />
                <path d="M6.6 6.6C4.3 8.2 2.5 10.3 2 12c.4 2.6 4.4 7 10 7 1.4 0 2.7-.3 3.9-.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
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
