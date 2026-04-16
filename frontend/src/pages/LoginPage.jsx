import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { loginSchema } from "../utils/authValidation";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      await login({ email: formData.email.trim(), password: formData.password });
      navigate("/");
    } catch (error) {
      if (error.name === "ValidationError") {
        const errorsMap = { email: "", password: "" };
        error.inner.forEach((issue) => {
          if (issue.path && !errorsMap[issue.path]) {
            errorsMap[issue.path] = issue.message;
          }
        });
        setFieldErrors(errorsMap);
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Login with your email and password."
      footerLinks={[
        { to: "/signup", label: "Create account" },
        { to: "/forgot-password", label: "Forgot password?" }
      ]}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          error={fieldErrors.email}
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="********"
          error={fieldErrors.password}
          value={formData.password}
          onChange={handleChange}
        />
        {submitError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{submitError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
