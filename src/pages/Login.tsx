import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router";
import { LoginSchema } from "../schemas/login";
import type { FirebaseError } from "firebase/app";
import { Loading } from "../components/Loading";
import { LoginFormData } from "../types/form";
import PrimaryButton from "../components/PrimaryButton";

const Login: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { login, userInfo, isLoading } = useAuth();

  const [loginError, setLoginError] = useState("");
  const [isSubmitable, setIsSubmitable] = useState(true);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: any): Promise<void> => {
    setIsSubmitable(false); // Disable button at start of submission
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";
    const values: LoginFormData = { email, password };
    const result = LoginSchema.safeParse(values);

    if (!result.success) {
      const formattedErrors = result.error.errors.reduce(
        (
          acc: { [x: string]: any },
          error: { path: (string | number)[]; message: any },
        ) => {
          acc[error.path[0]] = error.message;
          return acc;
        },
        {} as { [key: string]: string },
      );

      setFormErrors(formattedErrors);
      setIsSubmitable(true);
    } else {
      setFormErrors({});

      try {
        await login(email, password);
        setLoginError("");
        setIsSubmitable(true);
      } catch (error) {
        setLoginError((error as FirebaseError).message);
        setIsSubmitable(true);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (userInfo !== null) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex min-h-screen flex-col items-center px-3 py-6 sm:py-12">
      <div id="form-title" className="w-full max-w-md text-center">
        <h2 className="font-lilita-one-white-stroke py-[20px] text-3xl sm:text-5xl">
          Sign in
        </h2>
        <p className="form-sub-title-text text-sm sm:text-base">
          You gotta sign in first before you can join the auction!
        </p>
      </div>
      <div
        id="form-cantainer"
        className="card-fade-container mt-4 w-full max-w-[450px] rounded-l px-4 sm:mt-6 sm:px-8"
      >
        <form className="mt-8 space-y-6" action={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                name="email"
                formNoValidate
                required
                autoComplete="new-password"
                className={`relative mt-1 block w-full appearance-none border bg-white px-3 py-2 ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {formErrors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  // type={showPassword ? "text" : "password"}
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`relative block w-full appearance-none border bg-white px-3 py-2 ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  } rounded-md pr-10 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm`}
                  placeholder="Password"
                />
                {/* <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">
                    {showPassword ? "Hide" : "Show"} password
                  </span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    )}
                  </svg>
                </button> */}
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <PrimaryButton
              className="h-[66px] w-[100%]"
              type="submit"
              onClick={togglePasswordVisibility}
              disabled={!isSubmitable}
              isShowShadow
            >
              Sign in{" "}
            </PrimaryButton>
            {loginError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {loginError}
              </p>
            )}
          </div>
        </form>
      </div>
      <div className="card-fade-container mt-4 flex w-full max-w-[450px] flex-col items-center justify-between space-y-4 rounded-l px-4 sm:mt-6 sm:flex-row sm:space-y-0 sm:px-8">
        <div className="text-sm sm:text-base">
          You don't have an account yet?
        </div>
        <PrimaryButton
          className="h-[40px] w-full sm:h-[48px] sm:w-auto"
          onClick={() => {
            navigate("/signup");
          }}
        >
          Sign Up
        </PrimaryButton>
      </div>
      <Link
        to="/forgot-password"
        className="pt-[16px] text-sm transition duration-150 ease-in-out sm:pt-[20px]"
      >
        Forgot your password?
      </Link>
    </div>
  );
};

export default Login;
