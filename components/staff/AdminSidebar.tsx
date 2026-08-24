"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LeafDropletIcon,
  UsersIcon,
  MapPinIcon,
  ScheduleIcon,
  SortingIcon,
  ComplaintIcon,
  MegaphoneIcon,
  BarChartIcon,
  AuditLogIcon,
  HeadsetIcon,
  ChevronDownIcon,
  GridIcon,
  TruckIcon,
  GearIcon,
  ChecklistIcon,
  LocationIcon,
} from "@/components/icons";
import { LogoutButton } from "./LogoutButton";
import type { StaffRole } from "@/app/generated/prisma/client";

interface NavItem {
  href: string;
  label: string;
  Icon: typeof UsersIcon;
  roles?: StaffRole[];
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/staff/panel",
    label: "Панель",
    Icon: GridIcon,
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    href: "/staff/tasks",
    label: "Мої завдання",
    Icon: ChecklistIcon,
    roles: ["ADMIN", "INSPECTOR"],
  },
  {
    href: "/staff/mapa",
    label: "Мапа",
    Icon: LocationIcon,
    comingSoon: true,
  },
  {
    href: "/staff/personnel",
    label: "Управління персоналом",
    Icon: UsersIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/staff/zvernennya",
    label: "Звернення громадян",
    Icon: ComplaintIcon,
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    href: "/staff/maidanchyky",
    label: "Місця контейнерів",
    Icon: MapPinIcon,
    roles: ["ADMIN", "DISPATCHER"],
  },
  {
    href: "/staff/grafiky",
    label: "Графіки вивезення",
    Icon: ScheduleIcon,
    roles: ["ADMIN", "DISPATCHER"],
    comingSoon: true,
  },
  {
    href: "/staff/marshruty",
    label: "Маршрути",
    Icon: TruckIcon,
    roles: ["ADMIN", "DISPATCHER"],
    comingSoon: true,
  },
  {
    href: "/staff/inspektory",
    label: "Інспектори",
    Icon: UsersIcon,
    roles: ["ADMIN", "DISPATCHER"],
    comingSoon: true,
  },
  {
    href: "/staff/sortuvannya",
    label: "Правила сортування",
    Icon: SortingIcon,
    roles: ["ADMIN"],
    comingSoon: true,
  },
  {
    href: "/staff/ogoloshennya",
    label: "Оголошення",
    Icon: MegaphoneIcon,
    roles: ["ADMIN"],
    comingSoon: true,
  },
  {
    href: "/staff/analityka",
    label: "Аналітика",
    Icon: BarChartIcon,
    roles: ["ADMIN", "DISPATCHER"],
    comingSoon: true,
  },
  {
    href: "/staff/zvity",
    label: "Звіти",
    Icon: AuditLogIcon,
    roles: ["ADMIN", "DISPATCHER", "INSPECTOR"],
    comingSoon: true,
  },
  {
    href: "/staff/audit",
    label: "Журнал аудиту",
    Icon: AuditLogIcon,
    roles: ["ADMIN"],
    comingSoon: true,
  },
  {
    href: "/staff/profil",
    label: "Профіль",
    Icon: UsersIcon,
    comingSoon: true,
  },
  {
    href: "/staff/nalashtuvannya",
    label: "Налаштування",
    Icon: GearIcon,
    comingSoon: true,
  },
];

const SUPPORT_TEXT =
  "Електронна пошта, месенджер, телефон — робочі дні, 09:00–18:00 за київським часом.";

interface AdminSidebarProps {
  role: StaffRole;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedSection, setExpandedSection] = useState<
    "support" | "council" | null
  >(null);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col bg-primary-600 text-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <LeafDropletIcon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold leading-tight">Чисті Прилуки</p>
          <p className="text-xs leading-tight text-white/70">
            Платформа управління відходами
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Навігація кабінету">
        {visibleItems.map(({ href, label, Icon, comingSoon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          if (comingSoon) {
            return (
              <div
                key={href}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40"
                title="Незабаром"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium">
                  Незабаром
                </span>
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {role === "INSPECTOR" ? (
        <div className="border-t border-white/15 px-3 py-3">
          <LogoutButton variant="dark" />
        </div>
      ) : (
        <div className="border-t border-white/15 px-3 py-3">
          <button
            type="button"
            onClick={() =>
              setExpandedSection((prev) => (prev === "support" ? null : "support"))
            }
            aria-expanded={expandedSection === "support"}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            <HeadsetIcon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">Підтримка</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${
                expandedSection === "support" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSection === "support" ? (
            <p className="px-3 pt-1 pb-2 text-xs leading-relaxed text-white/65">
              {SUPPORT_TEXT}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() =>
              setExpandedSection((prev) => (prev === "council" ? null : "council"))
            }
            aria-expanded={expandedSection === "council"}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
              <LeafDropletIcon className="h-3 w-3" />
            </span>
            <span className="flex-1 text-left">Прилуцька міська рада</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${
                expandedSection === "council" ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSection === "council" ? (
            <p className="px-3 pt-1 pb-2 text-xs leading-relaxed text-white/65">
              Прилуцька міська територіальна громада, Чернігівська область.
            </p>
          ) : null}
        </div>
      )}
    </aside>
  );
}
