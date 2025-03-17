import { getApp, initializeApp } from "firebase/app";
import {
  confirmPasswordReset,
  getAuth,
  verifyPasswordResetCode,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PasswordResetSchema } from "../schemas/password-reset";
import Page from "../components/Page";
import useModalTimer from "../hooks/useModalTimer";
import Modal from "../components/Modal";
import PrimaryButton from "../components/PrimaryButton";

const initialCallbackApp = (apiKey: string) => {
  const appName = "authCallbackApp";
  let app;
  try {
    app = getApp(appName);
  } catch (error) {
    // If app is not initialized, initialize it
    app = initializeApp({ apiKey }, appName);
  }

  const auth = getAuth(app);
  if (!auth) throw new Error("Firebase Auth is not initialized.");

  return auth;
};

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oobCode = searchParams.get("oobCode");
  const apiKey = searchParams.get("apiKey") ?? "";
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>("");

  const [timer, setTimer] = useState(0);
  const [isModalCounterStarted, setIsModalCounterStarted] = useState(false);
  const {
    isModalOpen: isOpen,
    countdown,
    toggleModal,
  } = useModalTimer({
    initialCountdown: timer,
  });

  useEffect(() => {
    if (isModalCounterStarted && countdown === 0 && !isOpen) {
      setIsModalCounterStarted(false);
      handleModalClose(true);
    }
  }, [isOpen]);

  // verify valid url
  useEffect(() => {
    const verifyPasswordResetAction = async () => {
      if (!apiKey || !oobCode) {
        return setError(`Missing ${apiKey === null ? "apiKey" : "actionCode"}`);
      }

      try {
        const auth = initialCallbackApp(apiKey);
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);

        return email.length !== 0;
      } catch (err) {
        console.error("Error verifying oobCode:", err);
        return setError("Invalid or expired URL.");
      }
    };

    verifyPasswordResetAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oobCode !== null]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !oobCode) {
      return setFormError(`Cannot reset password."}`);
    }

    const formData = {
      email,
      password,
      confirmPassword,
    };

    setIsSubmitting(true);
    try {
      const result = await PasswordResetSchema.parseAsync(formData).catch(
        (error) => {
          return setFormError(error.message[0].message.toString());
        },
      );

      if (result !== undefined) {
        try {
          setIsSubmitting(false);
          setFormError("");

          const auth = initialCallbackApp(apiKey);
          // Save the new password.
          await confirmPasswordReset(auth, oobCode, formData.password);
          toggleModal();
          setTimer(3);
          setIsModalCounterStarted(true);
        } catch (error) {
          setFormError("Failed to reset password. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setFormError("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (isClose: boolean) => {
    if (isClose) {
      navigate("/signin");
    }
  };

  const renderForm = () => (
    <Page>
      <div className="flex min-h-screen flex-col items-center px-3 py-6 md:py-12">
        <div className="w-full max-w-md px-4 text-center">
          <h2 className="font-lilita-one-white-stroke py-[20px] text-4xl md:text-5xl">
            Reset Password
          </h2>
          <p className="form-sub-title-text text-sm md:text-base">
            Please enter your new password below
            <br />
            Make sure it's secure and easy to remember!
          </p>
        </div>

        <div className="card-fade-container mt-4 w-full max-w-[550px] rounded-l px-4 md:mt-6 md:px-8">
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 md:mt-8 md:space-y-6"
          >
            <div className="space-y-4 rounded-md">
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="input-label mb-2 block font-medium"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full rounded-md p-3"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="input-label mb-2 block font-medium"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input w-full rounded-md p-3"
                />
              </div>
              {formError && (
                <p className="mt-2 rounded p-2 text-sm text-red-500">
                  {formError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full rounded-full border-b-4 border-yellow-400 bg-purple-600 px-4 py-3 text-lg font-medium text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </Page>
  );

  return (
    <>
      {error.length === 0 ? (
        renderForm()
      ) : (
        <Page>
          <div className="flex min-h-screen items-center justify-center">
            <div className="font-lilita-one-white-stroke text-center text-4xl">
              {error}
            </div>
          </div>
        </Page>
      )}
      {isOpen && (
        <Modal
          title="Password Reset Successful!"
          subTitle="You’re all set! You can now join the auction and start bidding. Have fun!"
          onModalClose={handleModalClose}
          closeFromOverlay
        >
          <PrimaryButton
            className="h-[50px] w-full md:h-[66px]"
            type="submit"
            isShowShadow
            onClick={() => handleModalClose(true)}
          >
            Close ({countdown})
          </PrimaryButton>
        </Modal>
      )}
    </>
  );
}
