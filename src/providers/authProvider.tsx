import { UserCredential } from "firebase/auth";
import { AuthContext } from "../contexts/authContext";
import { FirebaseService } from "../services/FirebaseService";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../utils/LocalStorage";
import { SignupFormData } from "../types/form";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FirebaseOptions } from "firebase/app";
import useFirebase from "../hooks/useFirebase";
import { UserInfo } from "../types/user";
import {
  invalidateAppActivities,
  invalidateBidItemColors,
  invalidateBidItems,
  invalidateUserActivities,
} from "../services/CacheService";

export const AuthProvider = ({
  children,
  firebaseConfig,
}: {
  children: ReactNode;
  firebaseConfig: FirebaseOptions;
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const isFirebaseInitialized = useFirebase(firebaseConfig);
  const hasUserLoaded = useRef(false);

  useEffect(() => {
    if (!userInfo && !hasUserLoaded.current) {
      const storedUserInfo = getLocalStorageItem("auction_web_userInfo");
      const storedVerificationStatus = getLocalStorageItem(
        "auction_web_isEmailVerified",
      ) as boolean;

      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
        setIsEmailVerified(storedVerificationStatus || false);
      }
      hasUserLoaded.current = true;
    }
    setIsLoading(false);
  }, [userInfo]);

  useEffect(() => {
    if (isFirebaseInitialized && !hasUserLoaded.current) {
      const auth = FirebaseService.getFirebaseAuth();
      if (auth) {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (currentUser) {
            const userInfo = await FirebaseService.GetUserInfoById(
              currentUser.uid,
            );
            setUserInfo(userInfo);
            setLocalStorageItem("auction_web_userInfo", userInfo);
            setIsEmailVerified(currentUser.emailVerified);
          }
          setIsLoading(false);
        });
        return () => unsubscribe();
      } else {
        console.error("Firebase Auth is not initialized properly.");
        setIsLoading(false);
      }
    }
  }, [isFirebaseInitialized]);

  const register = async ({
    username,
    email,
    password,
    phoneNumber: phone,
    phoneCountryCode,
    firstName,
    lastName,
  }: SignupFormData) => {
    try {
      const userCredential = await FirebaseService.signup(email, password);

      await FirebaseService.updateUserProfile({ displayName: username });
      await FirebaseService.addDocument("users", {
        uid: userCredential.user.uid,
        email,
        username,
        phone,
        countryCode: phoneCountryCode,
        firstName,
        lastName,
      });
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential: UserCredential = await FirebaseService.signIn(
        email,
        password,
      );
      const userInfo = await FirebaseService.GetUserInfoById(
        userCredential.user.uid,
      );

      setUserInfo(userInfo);
      setLocalStorageItem("auction_web_userInfo", userInfo);
      setIsEmailVerified(userCredential.user.emailVerified);
      setLocalStorageItem(
        "auction_web_isEmailVerified",
        userCredential.user.emailVerified,
      );
    } catch (error: any) {
      console.error("Login failed", error.message);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await FirebaseService.signOut();
      if (userInfo) {
        invalidateUserActivities(userInfo.uid);
        invalidateAppActivities();
        invalidateBidItems();
        invalidateBidItemColors();
      }
      setUserInfo(null);
      setIsEmailVerified(false);
      setLocalStorageItem("auction_web_userInfo", null);
      setLocalStorageItem("auction_web_isEmailVerified", false);
    } catch (error) {
      console.error("Logout failed", (error as Error).message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        login,
        logout,
        register,
        isLoading,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
