import { z } from "zod";
import { validatePhoneNumber } from "../utils/PhoneNumberUtils";
import { allowEmailDomain, allowEmails } from "../configs";
import { FirebaseService } from "../services/FirebaseService";
// import { FirebaseService } from '~/services/FirebaseService'

const defaultNameCharacterLimit: number = 100;

const SignupSchema: z.ZodType = z
  .object({
    username: z
      .string({
        invalid_type_error: "username must be a string",
      })
      .min(1, "Please fill this in")
      .max(
        defaultNameCharacterLimit,
        `username must be at most ${defaultNameCharacterLimit} characters long`,
      ),
    firstName: z
      .string({
        invalid_type_error: "First Name must be a string",
      })
      .min(1, "Please fill this in")
      .max(
        defaultNameCharacterLimit,
        `First Name must be at most ${defaultNameCharacterLimit} characters long`,
      ),
    lastName: z
      .string({
        invalid_type_error: "Last Name must be a string",
      })
      .min(1, "Please fill this in")
      .max(
        defaultNameCharacterLimit,
        `Last Name must be at most ${defaultNameCharacterLimit} characters long`,
      ),
    email: z
      .string({
        invalid_type_error: "email must be a string",
      })
      .email("Please enter a valid email address")
      .refine((email) => email.trim().length > 0, {
        message: "Please fill this in",
        path: ["email"],
      })
      .refine(
        (email) => {
          const domain = email.split("@")[1];
          return (
            allowEmailDomain.includes(`@${domain}`) ||
            allowEmails.includes(email)
          );
        },
        {
          message: "Please use your company email",
          path: ["email"],
        },
      )
      .refine(
        async (email) => {
          if (email.trim().length === 0) return false;
          const isMailExist =
            await FirebaseService.fetchSignInMethodsForEmail(email);
          return !isMailExist;
        },
        {
          message: "This email already used",
          path: ["email"],
        },
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine((value) => {
        // Check for character types
        const hasLowerCase = /[a-z]/.test(value);
        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecialChar = /[!@#$%&]/.test(value);

        // Count how many character types are present
        const charTypes = [
          hasLowerCase,
          hasUpperCase,
          hasNumber,
          hasSpecialChar,
        ].filter(Boolean).length;
        return charTypes >= 3;
      }, "Your password needs to be at least 8 characters including at least 3 of the following 4 types of characters: a lower case letter, an uppercase letter, a number, a special character (such as !@#$%&)"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine((value) => {
        // Check for character types
        const hasLowerCase = /[a-z]/.test(value);
        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecialChar = /[!@#$%&]/.test(value);

        // Count how many character types are present
        const charTypes = [
          hasLowerCase,
          hasUpperCase,
          hasNumber,
          hasSpecialChar,
        ].filter(Boolean).length;
        return charTypes >= 3;
      }, "Your password needs to be at least 8 characters including at least 3 of the following 4 types of characters: a lower case letter, an uppercase letter, a number, a special character (such as !@#$%&)"),
    phoneNumber: z.string(),
    phonePrefix: z.string().min(1, "Phone Prefix is required"),
    phoneCountryCode: z.string().min(1, "Country Code is required"),
  })
  .superRefine(async (data, ctx) => {
    validatePhoneNumber(data, ctx);
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Your passwords don't match. Check, re-enter and try again.",
      });
    }
  });

export { SignupSchema };
