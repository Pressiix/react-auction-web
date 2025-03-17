import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import PhoneNumberInput from "../components/PhoneNumberInput";
import { SignupFormData } from "../types/form";
import { SignupSchema } from "../schemas/signup";
import { useAuth } from "../hooks/useAuth";
import PrimaryButton from "../components/PrimaryButton";
import Modal from "../components/Modal";
import EggComplete from "/images/ootn/egg-complete.png";
import useModalTimer from "../hooks/useModalTimer";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [signupError, setSignupError] = useState("");
  const [isSubmitable, setIsSubmitable] = useState(true);
  const { register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const timerRef = useRef<number>(0);
  const {
    isModalOpen: isSuccessModalOpen,
    countdown,
    toggleModal,
  } = useModalTimer({
    initialCountdown: timerRef.current,
  });

  useEffect(() => {
    if (isSuccessModalOpen === false && timerRef.current !== 0) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitable(false);

    const formData: SignupFormData = {
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      phonePrefix,
      phoneCountryCode,
    };

    await SignupSchema.parseAsync(formData)
      .catch((error) => {
        const formattedErrors = error.errors.reduce(
          (acc: Record<string, string>, error: any) => {
            acc[error.path[0]] = error.message;
            return acc;
          },
          {},
        );
        setFormErrors(formattedErrors);
        setIsSubmitable(true);
      })
      .then(async (result) => {
        if (result !== undefined) {
          setFormErrors({});
          setIsRegistering(true);

          try {
            setIsSubmitable(false);
            await register(formData);
            setSignupError("");
            setIsSubmitable(true);
            toggleModal(); // Only show modal after successful registration
            timerRef.current = 3;
          } catch (error) {
            setSignupError((error as Error).message);
          } finally {
            setIsRegistering(false);
            setIsSubmitable(true);
          }
        }
      });
  };

  const onModalClose = () => {
    toggleModal();
    navigate("/");
  };

  return (
    <>
      <div className="flex min-h-screen flex-col items-center px-3 py-6 md:py-12">
        <div id="form-title" className="w-full max-w-md px-4 text-center">
          <h2 className="font-lilita-one-white-stroke py-[20px] text-4xl md:text-5xl">
            Sign up
          </h2>
          <p className="form-sub-title-text text-sm md:text-base">
            You gotta sign up first before you can join the auction!
          </p>
        </div>

        <div
          id="form-container"
          className="card-fade-container mt-4 w-full max-w-[550px] rounded-l px-4 md:mt-6 md:px-8"
        >
          <form className="mt-6 space-y-4 md:mt-8 md:space-y-6">
            <div className="space-y-4 rounded-md">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                      formErrors.lastName ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Username field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="new-username"
                  spellCheck="false"
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                    formErrors.username ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formErrors.username}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (* Please use internal email)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Phone Number field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <PhoneNumberInput
                  onPhoneCountryChange={(e) => setPhoneCountryCode(e)}
                  onPhoneNumberChange={(e) => setPhoneNumber(e)}
                  onPhonePrefixChange={(e) => setPhonePrefix(e)}
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {signupError && (
              <p className="text-sm text-red-600">{signupError}</p>
            )}
            <PrimaryButton
              className="h-[50px] w-full md:h-[66px]"
              type="button"
              disabled={!isSubmitable}
              isShowShadow
              onClick={handleSubmit}
            >
              {!isSubmitable ? (
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                </div>
              ) : (
                "Sign Up"
              )}
            </PrimaryButton>
          </form>
        </div>

        <div className="card-fade-container mt-4 flex w-full max-w-[550px] flex-col items-center gap-4 rounded-l px-4 md:mt-6 md:flex-row md:gap-0 md:px-8">
          <div className="w-full text-center text-sm md:w-[60%] md:text-left md:text-base">
            if you already have an account?
          </div>
          <PrimaryButton
            className="h-[48px] w-full md:w-auto"
            onClick={() => {
              navigate("/signin");
            }}
          >
            Sign In
          </PrimaryButton>
        </div>
      </div>
      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Modal
          img={EggComplete}
          title={isRegistering ? "Processing..." : "Registration Is Complete!"}
          subTitle={
            isRegistering ? "Please wait..." : "You can now join the auction."
          }
          description={isRegistering ? "" : "Have fun bidding!"}
          children={
            <PrimaryButton
              className="h-[50px] w-full md:h-[66px]"
              type="submit"
              isShowShadow
              disabled={isRegistering}
              onClick={onModalClose}
            >
              {isRegistering ? "Processing..." : `Close (${countdown})`}
            </PrimaryButton>
          }
        />
      )}
    </>
  );
};

export default Signup;
