const Button = ({ children, type = "button", variant = "primary", ...rest }) => {
  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-md transition-colors disabled:opacity-60 ${variantStyles[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
