"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon, ChevronDownIcon } from "@/components/icons";
import { LogoutButton } from "./LogoutButton";
import { STAFF_ROLE_LABELS } from "@/lib/staff/roleBadge";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface AdminHeaderProps {
  fullName: string;
  role: string;
  urgentCount: number;
}

export function AdminHeader({ fullName, role, urgentCount }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const firstName = fullName.trim().split(/\s+/)[0] ?? fullName;

  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Доброго дня, {firstName}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Огляд системи управління відходами
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={
            urgentCount > 0
              ? `Сповіщення: ${urgentCount} звернень потребують уваги`
              : "Сповіщення"
          }
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <BellIcon className="h-5 w-5" />
          {urgentCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {urgentCount > 99 ? "99+" : urgentCount}
            </span>
          ) : null}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-gray-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
              {getInitials(fullName)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-gray-800">
                {STAFF_ROLE_LABELS[role] ?? role}
              </span>
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMenuOpen ? (
            <div className="card absolute right-0 z-10 mt-2 w-48 overflow-hidden py-1">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="truncate text-sm font-medium text-gray-800">
                  {fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {STAFF_ROLE_LABELS[role] ?? role}
                </p>
              </div>
              <div className="px-2 py-1">
                <LogoutButton />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
