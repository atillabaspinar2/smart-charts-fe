// create general purpose modal component that can be used to display any content
import React from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;

  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20000 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-10 w-96 rounded-lg bg-white p-6 shadow-lg">
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded border border-theme-primary bg-theme-surface text-theme-text transition-colors hover:bg-theme-primary"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
        {children}
      </div>
    </div>
  );
};
