import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getApp, initializeApp } from "firebase/app";
import {
  applyActionCode,
  checkActionCode,
  getAuth,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from "firebase/auth";

enum AuthMode {
  VERIFY_EMAIL = "verifyEmail",
  RESET_PASSWORD = "resetPassword",
  RECOVER_EMAIL = "recoverEmail",
}

interface AuthCallbackState {
  errorMessage?: string;
  status?: string;
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<AuthCallbackState>({});

  useEffect(() => {
    const handleAuth = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");
      const apiKey = searchParams.get("apiKey") ?? "";
      const lang = searchParams.get("lang") ?? "en";
      const continueUrl = searchParams.get("continueUrl");
      const searchParamsString = `?mode=${mode}&oobCode=${oobCode}&apiKey=${apiKey}&lang=${lang}&continueUrl=${continueUrl}`;
      // Configure the Firebase SDK
      const appName = "authCallbackApp";
      try {
        initializeApp({ apiKey }, appName);
      } catch (error) {
        // App might already be initialized
      }

      const app = getApp(appName);
      if (!app) {
        setState({ errorMessage: "Firebase is not initialized." });
        return;
      }

      const auth = getAuth(app);
      if (!auth) {
        setState({ errorMessage: "Firebase Auth is not initialized." });
        return;
      }

      if (!oobCode) {
        setState({ errorMessage: "URL is invalid" });
        return;
      }

      try {
        switch (mode) {
          case AuthMode.VERIFY_EMAIL:
            await applyActionCode(auth, oobCode);
            navigate("/verification-success");
            break;

          case AuthMode.RESET_PASSWORD: {
            const email = await verifyPasswordResetCode(auth, oobCode);
            if (email) {
              navigate(`/password-reset${searchParamsString}`);
            }
            break;
          }

          case AuthMode.RECOVER_EMAIL: {
            let restoredEmail: string | null | undefined = null;
            const info = await checkActionCode(auth, oobCode);
            restoredEmail = info["data"]["email"];

            await applyActionCode(auth, oobCode);
            await sendPasswordResetEmail(auth, restoredEmail ?? "");
            navigate("/password-reset-confirmation");
            break;
          }

          default:
            setState({ errorMessage: "URL is invalid" });
        }
      } catch (error) {
        setState({
          errorMessage:
            (error as Error).message ||
            "An error occurred during authentication",
        });
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12">
      {/* Left Content */}
      <div className="col-span-1 px-[16vw] md:px-[20vw] lg:col-span-7 lg:px-[18vw]">
        <h1 className="pt-[50vh] text-center text-[#939191]">
          {state.errorMessage}
        </h1>
      </div>

      {/* Right Image */}
      <div className="hidden lg:col-span-5 lg:block">
        <div
          className="h-screen bg-cover"
          style={{
            backgroundImage: 'url("/assets/images/signup-cover.jpg")',
          }}
        />
      </div>
    </div>
  );
}
