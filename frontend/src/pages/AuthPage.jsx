import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";

const getResetTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "";
};

const AuthPage = () => {
  const { login, signup, forgotPassword, resetPassword } = useAuthContext();
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    resetToken: getResetTokenFromUrl()
  });

  const title = useMemo(() => {
    if (mode === "signup") return "Create Account";
    if (mode === "forgot") return "Forgot Password";
    if (mode === "reset") return "Reset Password";
    return "Login";
  }, [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setFeedback({ error: "", success: "" });
    try {
      if (mode === "signup") {
        await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
      } else if (mode === "login") {
        await login({ email: formData.email.trim(), password: formData.password });
      } else if (mode === "forgot") {
        const result = await forgotPassword(formData.email.trim());
        const extra =
          result?.resetUrl && import.meta.env.DEV ? ` Development reset URL: ${result.resetUrl}` : "";
        setFeedback({ error: "", success: `Reset instructions sent.${extra}` });
      } else if (mode === "reset") {
        await resetPassword(formData.resetToken.trim(), formData.password);
        setFeedback({ error: "", success: "Password reset successful. You can now login." });
        setMode("login");
      }
    } catch (error) {
      setFeedback({ error: error.message, success: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title={title}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        )}

        {(mode === "login" || mode === "signup" || mode === "forgot") && (
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        )}

        {(mode === "login" || mode === "signup" || mode === "reset") && (
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />
        )}

        {mode === "reset" && (
          <Input
            label="Reset Token"
            name="resetToken"
            value={formData.resetToken}
            onChange={handleChange}
            placeholder="Paste reset token"
            required
          />
        )}

        {feedback.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{feedback.error}</p>}
        {feedback.success && (
          <p className="rounded bg-green-50 p-2 text-sm text-green-700">{feedback.success}</p>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : title}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button className="text-blue-700" onClick={() => setMode("login")} type="button">
          Login
        </button>
        <button className="text-blue-700" onClick={() => setMode("signup")} type="button">
          Signup
        </button>
        <button className="text-blue-700" onClick={() => setMode("forgot")} type="button">
          Forgot Password
        </button>
        <button className="text-blue-700" onClick={() => setMode("reset")} type="button">
          Reset Password
        </button>
      </div>
    </Card>
  );
};

export default AuthPage;
