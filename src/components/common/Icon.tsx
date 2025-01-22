import React from "react";

export const sizes = {
  S: "12px",
  M: "16px",
  L: "32px",
} as const;

export const Icon = ({
  icon,
  size,
}: {
  icon: React.ReactNode;
  size: typeof sizes;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-6"
    style={{
      width: size,
      height: size,
    }}
  >
    {icon}
  </svg>
);
