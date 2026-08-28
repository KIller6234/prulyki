# Чисті Прилуки — MVP

Вебплатформа управління побутовими відходами Прилуцької міської
територіальної громади. Це 4-денний MVP на правдоподібних даних —
контекст, свідомі спрощення проти повного ТЗ і план допрацювання описані
в `/home/pfpgp/.claude/plans/swirling-cuddling-simon.md`.

## Стек

Next.js 16 (App Router, Turbopack) · TypeScript strict · Prisma 7 (driver
adapter `@prisma/adapter-pg`) · PostgreSQL 16 + pgvector + pg_trgm ·
Tailwind CSS · Leaflet · Zod · react-hook-form · Anthropic SDK (опційно).

## Локальний запуск

1. **Залежності:**
   ```bash
   npm install
   ```

2. **База даних.** Локально піднімається через Docker (той самий образ,
   що й у Supabase — `pgvector/pgvector:pg16`):
   ```bash
   docker run -d --name prulyky-postgres \
     -e POSTGRES_USER=prulyky \
     -e POSTGRES_PASSWORD=prulyky_dev_password \
     -e POSTGRES_DB=prulyky \
     -p 55432:5432 \
     pgvector/pgvector:pg16
   ```
   `.env` вже містить відповідний `DATABASE_URL`. Для переїзду на реальний
   Supabase-проєкт достатньо замінити значення `DATABASE_URL` — код цього
   не потребує (адаптер `PrismaPg` працює з будь-яким Postgres-з'єднанням).

3. **Міграції та наповнення даними:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   Seed завантажує **реальні дані КП «Послуга»** (Прилуцька міська рада):
   245 вулиць громади з графіками вивезення ТПВ, 60 контейнерних
   майданчиків з координатами й фракціями, 9 сміттєвозів. Джерело —
   відскановані графіки у `prisma/seed-data/source/`; чисті JSON для seed
   формуються скриптом `scripts/build-seed-data.py` (`pip install openpyxl
   && python3 scripts/build-seed-data.py`) і закомічені в репозиторій, тож
   для самого seed Python не потрібен. Додатково: 40 позицій довідника
   сортування, 5 staff-акаунтів, база знань ШІ-консультанта (реальні витяги
   Закону «Про звернення громадян» і ДСанПіН + один явно позначений
   placeholder-документ). Демо-звернень seed більше не створює.

4. **Запуск:**
   ```bash
   npm run dev
   ```
   Відкрити http://localhost:3000

## Deploy на Vercel + Supabase

1. Створити проєкт на Supabase, у SQL-редакторі увімкнути розширення:
   `create extension if not exists vector; create extension if not exists pg_trgm;`
2. У Vercel: імпортувати репозиторій, задати env-змінні з `.env.example`
   (`DATABASE_URL` — Supabase connection string; `SESSION_SECRET` —
   новий випадковий рядок ≥32 символів, відмінний від dev-значення;
   `STAFF_SEED_PASSWORD` — лише якщо сідинг запускається повторно).
3. `prisma generate` виконується автоматично (`postinstall`-скрипт).
   Міграції та первинний seed на Supabase виконати окремо перед першим
   деплоєм (з локальної машини, вказавши Supabase `DATABASE_URL`):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. Файли, завантажені через `LocalDiskStorageProvider` (`public/uploads`),
   на Vercel не персистентні між білдами — перед промисловим використанням
   підключити `SupabaseStorageProvider` (env-змінні для цього вже
   зарезервовані в `.env.example`), реалізувавши `StorageProvider` з
   `lib/storage.ts` за тим самим патерном, що й AI-провайдер.

## Staff-кабінет

Вхід: http://localhost:3000/staff/login

| Роль | E-mail | Пароль |
|---|---|---|
| Адміністратор | `admin@prylukymtg.example` | значення `STAFF_SEED_PASSWORD` з `.env` (dev-дефолт `ChangeMe123!`) |
| Диспетчер | `dispatcher@prylukymtg.example` | те саме |
| Інспектор | `inspector@prylukymtg.example` | те саме |

`prylukymtg.example` — умовний домен (`.example` зарезервовано IANA для
плейсхолдерів), не реальна адреса громади.

**Обов'язково змінити пароль і перегенерувати `SESSION_SECRET` перед
промисловою експлуатацією** (розділ 6 ТЗ).

## ШІ-консультант

Без `ANTHROPIC_API_KEY` у `.env` консультант (`/chat`) працює в
mock-режимі: чесно повертає найрелевантніші фрагменти бази знань без
виклику LLM, з явним написом «AI-провайдер ще не підключено». Після
додавання ключа підключення реального провайдера відбувається без правок
коду — див. `lib/ai/index.ts`.

## Перевірка перед комітом

```bash
npx tsc --noEmit
npx eslint . --max-warnings=0
npx next build
```

## Що ще не реалізовано в цьому MVP

2FA · повний RBAC · журнал аудиту · email/push-сповіщення · аналітичні
дашборди й ROI · пентест · offline PWA · i18n · відкриті дані data.gov.ua ·
інтеграція апаратних датчиків · повний пакет документації розд. 7 ТЗ.
Повний список — у файлі плану, розділ «Що ТЗ вимагає, але свідомо не
робимо».
