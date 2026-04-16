import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/Auth";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuthContext } from "../context/AuthContext";
import { signupSchema } from "../utils/authValidation";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuthContext();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onChange"
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values) => {
    setSubmitError("");
    try {
      await signup(values);
      navigate("/");
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Signup to access your dashboard."
      footerLinks={[
        { to: "/login", label: "Already have an account?" },
        { to: "/forgot-password", label: "Forgot password?" }
      ]}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" placeholder="John Doe" error={errors.name?.message} {...register("name")} />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="********"
          error={errors.password?.message}
          {...register("password")}
        />
        {submitError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{submitError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Signup"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default SignupPage;
