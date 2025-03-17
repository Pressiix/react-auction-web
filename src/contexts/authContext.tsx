import { createContext } from "react";
import { SignupFormData } from "../types/form";

interface AuthContextType {
  userInfo: any | null; // Changed from user to userInfo
  login: (email: string, password: string) => Promise<void>;
  register(data: SignupFormData): Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isEmailVerified: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
