import { forwardRef } from "react";

const Input = forwardRef(({ label, error, ...rest }, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
