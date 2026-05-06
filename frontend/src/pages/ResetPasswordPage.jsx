import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { resetPasswordSchema } from "../utils/authValidation";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultToken = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const { resetPassword } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      token: defaultToken,
      password: "",
      newPassword: ""
    }
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSuccessMessage("");
    try {
      await resetPassword(values);
      setSuccessMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Set your new password securely."
      footerLinks={[{ to: "/login", label: "Back to login" }]}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Reset Token" placeholder="Paste token" error={errors.token?.message} {...register("token")} />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="New Password"
          type="password"
          placeholder="********"
          error={errors.newPassword?.message}
          {...register("newPassword")}
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
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
