import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "red" | "green" | "yellow" | "purple" | "gray";
  variant?: "spinner" | "dots" | "pulse" | "bars";
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  color = "blue",
  variant = "spinner",
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Color classes mapping
  const colorClasses = {
    blue: "border-blue-500",
    red: "border-red-500",
    green: "border-green-500",
    yellow: "border-yellow-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
  };

  const renderSpinner = () => (
    <div
      className={`${sizeClasses[size]} border-4 border-t-transparent ${colorClasses[color]} animate-spin rounded-full`}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      <div
        className={`${sizeClasses[size]} animate-bounce rounded-full bg-current`}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={`${sizeClasses[size]} animate-bounce rounded-full bg-current`}
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className={`${sizeClasses[size]} animate-bounce rounded-full bg-current`}
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );

  const renderPulse = () => (
    <div
      className={`${sizeClasses[size]} animate-pulse rounded-full bg-current`}
    />
  );

  const renderBars = () => (
    <div className="flex h-10 items-end space-x-1">
      <div
        className="w-2 animate-[growth_1s_ease-in-out_infinite] bg-current"
        style={{ height: "60%" }}
      />
      <div
        className="w-2 animate-[growth_1s_ease-in-out_infinite] bg-current"
        style={{ animationDelay: "0.2s", height: "80%" }}
      />
      <div
        className="w-2 animate-[growth_1s_ease-in-out_infinite] bg-current"
        style={{ animationDelay: "0.4s", height: "100%" }}
      />
      <div
        className="w-2 animate-[growth_1s_ease-in-out_infinite] bg-current"
        style={{ animationDelay: "0.6s", height: "80%" }}
      />
      <div
        className="w-2 animate-[growth_1s_ease-in-out_infinite] bg-current"
        style={{ animationDelay: "0.8s", height: "60%" }}
      />
    </div>
  );

  const variants = {
    spinner: renderSpinner,
    dots: renderDots,
    pulse: renderPulse,
    bars: renderBars,
  };

  return (
    <div className="flex items-center justify-center">
      {variants[variant]()}
    </div>
  );
};

// Loading Overlay component for full-screen or container loading
const LoadingOverlay: React.FC<LoadingProps & { fullScreen?: boolean }> = ({
  fullScreen = false,
  ...props
}) => {
  return (
    <div
      className={`
      bg-opacity-80 flex items-center justify-center bg-white
      ${fullScreen ? "fixed inset-0 z-50" : "absolute inset-0"}
    `}
    >
      <Loading {...props} />
    </div>
  );
};

export { Loading, LoadingOverlay };
