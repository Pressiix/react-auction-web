import { BrowserRouter, Routes, Route } from "react-router";
import ItemDetail from "./pages/ItemDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { firebaseConfig } from "./configs";
import AuthCallback from "./pages/AuthCallback";
import VerificationSuccess from "./pages/VerificationSuccess";
import Signup from "./pages/Signup";
import BiddingList from "./pages/BiddingList";
import { AuthProvider } from "./providers/authProvider";
import { useState, useEffect } from "react";
import { FirebaseService } from "./services/FirebaseService";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/CacheService";
import BidEnd from "./pages/BidEnd";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await FirebaseService.initialize(firebaseConfig);
        setIsInitialized(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Firebase initialization failed";
        console.error("Firebase initialization failed:", err);
        setError(errorMessage);
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    return <div>Error initializing app: {error}</div>;
  }

  if (!isInitialized) {
    return <div></div>;
  }

  const AppRouter = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BiddingList />} />
          <Route path="/bidding-list" element={<BiddingList />} />
          <Route path="/bid-items/:itemId" element={<ItemDetail />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route
            path="/verification-success"
            element={<VerificationSuccess />}
          />
          <Route path="/bid-end/:itemId" element={<BidEnd />} />
        </Routes>
      </BrowserRouter>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider firebaseConfig={firebaseConfig}>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
