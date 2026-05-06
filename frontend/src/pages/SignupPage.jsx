import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { signupSchema } from "../utils/authValidation";
import { ROLES } from "../utils/constants";



const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.GUEST);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: { role: ROLES.GUEST },
    mode: "onChange"
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // both visitor and owner map to "guest" role in backend
    setValue("role", ROLES.GUEST, { shouldValidate: true });
  };

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await signup({ ...values, role: selectedRole });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <AuthShell
      title="Join Biznest"
      subtitle="Pick your role and start your journey."
      footerLinks={[{ to: "/login", label: "Already have an account? Sign in" }]}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

        {/* Role selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select your role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: ROLES.GUEST,
                label: "Business Owner",
                description: "List your business and reach more customers",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
              },
              {
                value: "visitor",
                label: "Visitor",
                description: "Explore businesses and discover local services",
                icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              }
            ].map(r => (
              <button key={r.value} type="button" onClick={() => setSelectedRole(r.value)}
                className={["flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all",
                  selectedRole === r.value
                    ? "border-indigo-500/60 bg-indigo-500/10 ring-2 ring-indigo-500/25"
                    : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60"
                ].join(" ")}>
                <span className={selectedRole === r.value ? "text-indigo-400" : "text-slate-500"}>{r.icon}</span>
                <span className="text-sm font-semibold text-white">{r.label}</span>
                <span className="text-xs text-slate-500">{r.description}</span>
              </button>
            ))}
          </div>
        </div>

        <Input label="Full name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, upper, lower & number"
          error={errors.password?.message}
          {...register("password")}
        />

        {submitError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full justify-center py-3 text-base">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignupPage;
