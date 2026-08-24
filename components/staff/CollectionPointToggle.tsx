"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CollectionPointToggleProps {
  id: string;
  status: string;
}

export function CollectionPointToggle({ id, status }: CollectionPointToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    const isActive = status === "ACTIVE";
    const reason = isActive
      ? window.prompt("Причина деактивації майданчика:")
      : undefined;
    if (isActive && !reason) return;

    setIsSubmitting(true);
    try {
      await fetch(`/api/maidanchyky/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isActive ? "INACTIVE" : "ACTIVE",
          deactivationReason: reason,
        }),
      });
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isSubmitting}
      className={
        status === "ACTIVE"
          ? "text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
          : "text-xs font-medium text-primary-700 hover:underline disabled:opacity-60"
      }
    >
      {status === "ACTIVE" ? "Деактивувати" : "Активувати"}
    </button>
  );
}
