import React from "react";

const HorizontalDivider: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => {
  return (
    <div
      className={`h-[1px] w-full bg-gray-200 ${className ?? ""}`}
      style={style}
    />
  );
};

export default HorizontalDivider;
