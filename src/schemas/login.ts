import { z } from "zod";

const LoginSchema: z.ZodType = z.object({
  email: z
    .string({
      invalid_type_error: "email must be a string",
    })
    .email("Please enter a valid email address")
    .refine((email) => email.trim().length > 0, {
      message: "Please fill this in",
      path: ["email"],
    }),
  password: z.string(),
});

export { LoginSchema };
