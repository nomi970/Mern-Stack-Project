import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { loginSchema } from "../utils/authValidation";
import { ROLES } from "../utils/constants";

const EmailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [formData, setFormData] = useState({ email: "", password: "" });

  if (isAuthenticated) {
    return <Navigate to={user?.role === ROLES.SUPER_ADMIN ? "/admin" : "/dashboard"} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setSubmitError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      const result = await login({ email: formData.email.trim(), password: formData.password });
      navigate(result?.role === ROLES.SUPER_ADMIN ? "/admin" : "/dashboard", { replace: true });
    } catch (error) {
      if (error.name === "ValidationError") {
        const map = { email: "", password: "" };
        error.inner.forEach((i) => { if (i.path && !map[i.path]) map[i.path] = i.message; });
        setFieldErrors(map);
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footerLinks={[
        { to: "/signup", label: "Don't have an account? Sign up" },
        { to: "/forgot-password", label: "Forgot password?" }
      ]}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
          value={formData.email}
          onChange={handleChange}
          icon={<EmailIcon />}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          error={fieldErrors.password}
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
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
              Signing in...
            </span>
          ) : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
