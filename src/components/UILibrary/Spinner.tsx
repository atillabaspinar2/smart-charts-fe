import React from "react";

export const Spinner: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    className="animate-spin text-primary"
    style={{ display: "block", margin: "auto" }}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeDasharray="31.4 31.4"
      strokeLinecap="round"
    />
  </svg>
);
