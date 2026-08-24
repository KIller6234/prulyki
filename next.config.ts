import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" — лише для Docker/VPS-деплою (див. DEPLOY.md). На Netlify
  // (і будь-якому managed-хостингу з власним адаптером Next.js) цей режим
  // не потрібен і не підтримується — Netlify встановлює NETLIFY=true під
  // час білда, тож пропускаємо його там автоматично.
  ...(process.env.NETLIFY ? {} : { output: "standalone" }),
};

export default nextConfig;
