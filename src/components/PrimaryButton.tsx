import React from "react";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  isShowShadow?: boolean;
  variant?: "primary" | "outlined";
}

export default function PrimaryButton({
  onClick,
  children,
  className = "",
  disabled = false,
  isShowShadow = false,
  variant = "primary",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variant === "outlined" ? "outlined-" : ""}primary-button ${isShowShadow ? "primary-shadow-button" : ""} ${
        !disabled ? "" : "button-disabled cursor-not-allowed"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
