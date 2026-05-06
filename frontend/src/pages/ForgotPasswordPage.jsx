import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { forgotPasswordSchema } from "../utils/authValidation";

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onChange"
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    try {
      const result = await forgotPassword(values.email.trim());
      const resetInfo = result?.resetToken && import.meta.env.DEV ? ` Token: ${result.resetToken}` : "";
      setSuccessMessage(`If this email exists, reset instructions were generated.${resetInfo}`);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email to receive reset instructions."
      footerLinks={[
        { to: "/login", label: "Back to login" },
        { to: "/signup", label: "Create account" }
      ]}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        {submitError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-400">{successMessage}</p>
          </div>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full justify-center py-3">
          {isSubmitting ? "Submitting..." : "Send reset request"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
