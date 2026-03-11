import React, { useState } from "react";

export const TabView: React.FC<{
  title: string;
  children?: React.ReactNode;
}> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border-t border-gray-300 flex flex-wrap">
      <button
        className="inline-flex justify-between items-center py-2 px-4 bg-gray-200 hover:bg-gray-300 focus:outline-none whitespace-nowrap min-w-40"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-medium">{title}</span>
        <svg
          className={`w-4 h-4 transform transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
};
