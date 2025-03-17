import { useState, useEffect } from "react";
import { FirebaseService } from "../services/FirebaseService";
import type { FirebaseOptions } from "firebase/app";

const useFirebase = (config: FirebaseOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await FirebaseService.initialize(config);
        setIsInitialized(true); // Firebase is initialized
      } catch (error) {
        console.error("Firebase initialization failed:", error);
      }
    };

    initializeFirebase();
  }, [config]);

  return isInitialized; // Return whether Firebase is initialized
};

export default useFirebase;
