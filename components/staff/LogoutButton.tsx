"use client";

import { useRouter } from "next/navigation";
import { LogoutIcon } from "@/components/icons";

interface LogoutButtonProps {
  variant?: "light" | "dark";
}

const VARIANT_CLASSES: Record<NonNullable<LogoutButtonProps["variant"]>, string> = {
  light:
    "text-gray-600 hover:bg-red-50 hover:text-red-700",
  dark: "text-white/80 hover:bg-white/10 hover:text-white",
};

export function LogoutButton({ variant = "light" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/staff/auth/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  };

  if (variant === "dark") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${VARIANT_CLASSES.dark}`}
      >
        <LogoutIcon className="h-5 w-5 shrink-0" />
        Вийти
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${VARIANT_CLASSES.light}`}
    >
      Вийти
    </button>
  );
}
