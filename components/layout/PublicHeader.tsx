"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeafDropletIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/", label: "Головна" },
  { href: "/mapa", label: "Мапа" },
  { href: "/grafik", label: "Графіки" },
  { href: "/pravyla-sortuvannya", label: "Сортування" },
  { href: "/zvernennya", label: "Звернення" },
] as const;

// Тінь з'являється лише після невеликого прокручування — відділяє header
// від контенту (в т. ч. мапи) без ефекту "злипання" на самому верху.
const SCROLL_SHADOW_THRESHOLD_PX = 8;

// Вище за z-index Leaflet-контролів (.leaflet-top/.leaflet-bottom = 1000) і
// власні попапи мапи (z-[1000]) — header завжди має бути поверх мапи.
const HEADER_Z_INDEX_CLASS = "z-[1100]";

export function PublicHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_SHADOW_THRESHOLD_PX);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 ${HEADER_Z_INDEX_CLASS} bg-white transition-shadow duration-200 ${
        isScrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : ""
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
            <LeafDropletIcon className="h-5 w-5" />
          </span>
          <span className="font-bold text-gray-800">Чисті Прилуки</span>
        </Link>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Основна навігація"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/staff/login"
            className="hidden rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 sm:block"
          >
            Кабінет співробітника
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-menu"
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
            className="rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {isMenuOpen ? (
                <path
                  fill="currentColor"
                  d="M6.4 4.9 12 10.6l5.6-5.7 1.4 1.4-5.7 5.7 5.7 5.6-1.4 1.4-5.6-5.7-5.6 5.7-1.4-1.4 5.7-5.6-5.7-5.7z"
                />
              ) : (
                <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav
          id="public-mobile-menu"
          aria-label="Мобільна навігація"
          className="border-t border-gray-200 bg-white px-4 py-2 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/staff/login"
            onClick={() => setIsMenuOpen(false)}
            className="block rounded px-3 py-2 text-sm font-medium text-primary-700 hover:bg-gray-100"
          >
            Кабінет співробітника
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
