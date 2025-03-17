import { z } from "zod";
import { LoginSchema } from "../schemas/login";
import { ForgotPasswordSchema } from "../schemas/forgot-password";
import { PasswordResetSchema } from "../schemas/password-reset";
import { SignupSchema } from "../schemas/signup";

type LoginFormData = z.infer<typeof LoginSchema>;
type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
type PasswordResetFormData = z.infer<typeof PasswordResetSchema>;
type SignupFormData = z.infer<typeof SignupSchema>;

export type {
  LoginFormData,
  ForgotPasswordFormData,
  PasswordResetFormData,
  SignupFormData,
};
