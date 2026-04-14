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
    <AuthShell title="Reset Password" subtitle="Set your new password securely." footerLinks={[{ to: "/login", label: "Back to login" }]}>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
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
        {submitError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{submitError}</p>}
        {successMessage && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{successMessage}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPasswordPage;
