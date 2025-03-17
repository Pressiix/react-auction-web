import { useState, useEffect } from "react";

function useModalTimer({ initialCountdown }: { initialCountdown: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    if (initialCountdown) {
      setCountdown(initialCountdown);
    }
  }, [initialCountdown]);

  useEffect(() => {
    if (isModalOpen && !countdown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown - 1 === 0) setIsModalOpen(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, isModalOpen, initialCountdown]);

  const toggleModal = () => {
    setIsModalOpen(true);
    setCountdown(initialCountdown);
  };

  return {
    isModalOpen,
    countdown,
    toggleModal,
  };
}

export default useModalTimer;
