import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange"
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await login({ name: values.name.trim(), password: values.password });
      navigate("/");
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Login with your name and password."
      footerLinks={[
        { to: "/signup", label: "Create account" },
        { to: "/forgot-password", label: "Forgot password?" }
      ]}
    >
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />
        {submitError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{submitError}</p>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
