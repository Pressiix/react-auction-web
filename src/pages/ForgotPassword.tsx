import type React from "react";
import { useState, useCallback } from "react";
import { ForgotPasswordSchema } from "../schemas/forgot-password";
import { FirebaseError } from "firebase/app";
import { FirebaseService } from "../services/FirebaseService";
import PrimaryButton from "../components/PrimaryButton";
import Page from "../components/Page";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = useCallback(async (email: string) => {
    try {
      await ForgotPasswordSchema.parseAsync({ email: email });
      const isEmailExisted =
        (await FirebaseService.getDocuments("/users", { email }, 1)).length !==
        0;

      if (!isEmailExisted)
        return { isValid: false, error: "Email does not exist" };

      return { isValid: isEmailExisted, error: "" };
    } catch (error: any) {
      const formattedError =
        error.errors?.[0]?.message || "Invalid email format";
      return { isValid: false, error: formattedError };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    // Client-side validation
    const { isValid, error: validationError } = await validateForm(email);
    if (!isValid) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // send password recovery email
      await FirebaseService.sendPasswordRecoveryEmail(email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("No account found with this email address.");
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          default:
            setError("Failed to send reset link. Please try again later.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error("Password reset failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="flex min-h-screen flex-col items-center px-3 py-6 md:py-12">
        <div className="w-full max-w-md px-4 text-center">
          <h2 className="font-lilita-one-white-stroke py-[20px] text-4xl md:text-5xl">
            Forgot Password
          </h2>
        </div>

        <div className="card-fade-container mt-4 w-full max-w-[550px] rounded-l px-4 md:mt-6 md:px-8">
          {!success ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 md:mt-8 md:space-y-6"
            >
              <div className="space-y-4 rounded-md">
                <label
                  htmlFor="email"
                  className="mb-2 block font-medium text-gray-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[48px] w-full rounded-md bg-white p-3"
                  required
                />
                {error && (
                  <p className="mt-2 rounded  p-2 text-sm text-red-500">
                    {error}
                  </p>
                )}
              </div>

              <PrimaryButton
                type="submit"
                disabled={isSubmitting}
                className="relative w-full rounded-full border-b-4 border-yellow-400 bg-purple-600 px-4 py-3 text-lg font-medium text-white transition-colors hover:bg-purple-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </PrimaryButton>
            </form>
          ) : (
            <div className="py-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-purple-600">
                Check Your Email
              </h2>
              <p className="mb-6 text-gray-800">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="text-purple-600 underline hover:text-purple-800"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/signin"
            className="text-gray-800 underline hover:text-purple-700"
          >
            Sign in
          </a>
          <span className="mx-2 text-gray-800">/</span>
          <a
            href="/signup"
            className="text-gray-800 underline hover:text-purple-700"
          >
            Sign up
          </a>
        </div>
      </div>
    </Page>
  );
}
