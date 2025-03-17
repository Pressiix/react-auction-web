import { useState, useEffect } from "react";

function useNetworkStatus() {
  // State to track online status
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Event handlers to update the network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners for online and offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default useNetworkStatus;
