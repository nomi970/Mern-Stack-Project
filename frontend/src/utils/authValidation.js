import * as yup from "yup";

const strongPasswordMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, and number.";

export const loginSchema = yup.object({
  name: yup.string().trim().required("Name is required."),
  password: yup.string().required("Password is required.")
});

export const signupSchema = yup.object({
  name: yup.string().trim().min(2, "Name must be at least 2 characters.").required("Name is required."),
  email: yup.string().email("Enter a valid email address.").required("Email is required."),
  password: yup
    .string()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, strongPasswordMessage)
    .required("Password is required.")
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email("Enter a valid email address.").required("Email is required.")
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required("Reset token is required."),
  password: yup
    .string()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, strongPasswordMessage)
    .required("Password is required."),
  newPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match.")
    .required("Please confirm password.")
});
