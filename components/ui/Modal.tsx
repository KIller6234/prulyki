"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export function Modal({
  title,
  onClose,
  children,
  maxWidthClassName = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card relative w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
