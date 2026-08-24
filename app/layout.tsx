import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Чисті Прилуки",
  description:
    "Вебплатформа управління побутовими відходами Прилуцької міської територіальної громади.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
