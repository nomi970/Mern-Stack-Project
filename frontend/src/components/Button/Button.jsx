const Button = ({ children, type = "button", variant = "primary", className = "", ...rest }) => {
  const variantStyles = {
    primary: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/25",
    secondary: "bg-white/8 hover:bg-white/15 text-slate-300 border border-white/10",
    danger: "bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
    success: "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
    warning: "bg-amber-500/90 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/8"
  };

  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant] ?? variantStyles.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
