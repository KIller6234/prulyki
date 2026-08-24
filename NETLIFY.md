# Деплой на Netlify + Supabase (демо)

Netlify — це serverless-хостинг: збирає й роздає Next.js, але не дає ні
Postgres, ні постійного диска для завантажених фото (як і Vercel). Тому БД
та сховище фото винесені в Supabase — .env.example вже мав під це
заготовлені змінні.

Паралельний варіант деплою — HOSTiQ VPS через Docker, описаний у
`DEPLOY.md`. Файли для нього (`Dockerfile`, `docker-compose.yml`,
`deploy/nginx.conf`) лишаються в репозиторії про запас, цей runbook їх не
використовує.

## 1. Створити проєкт Supabase

1. https://supabase.com/dashboard → **New project**.
2. Обрати регіон ближче до України (наприклад Frankfurt, `eu-central-1`).
3. Задати надійний Database Password — знадобиться в рядку підключення.
4. Дочекатись ініціалізації проєкту (1-2 хв).

### Рядок підключення до БД

**Кнопка "Connect" на сторінці проєкту → Direct Connection → перемкнути на
"Session pooler".** Пряме з'єднання (`db.xxxxxxxxxxxx.supabase.co:5432`)
резолвиться лише в IPv6-адресу — у більшості середовищ без IPv6-виходу
(включно з тим, де готувався цей деплой) воно просто недосяжне. Session
pooler — IPv4-сумісний, працює як звичайне з'єднання (без обмежень
prepared statements, на відміну від Transaction pooler на порту 6543):

```
postgresql://postgres.xxxxxxxxxxxx:ВАШ_ПАРОЛЬ@aws-1-<region>.pooler.supabase.com:5432/postgres
```

### Storage bucket для фото звернень

**Storage → New bucket**:
- Назва: `complaints` (код звертається саме до цієї назви — `lib/storage.ts`).
- **Public bucket** — увімкнути (публічні URL фото відображаються без
  логіну на сторінці звернення/реєстру).

### Ключі API

**Settings → API**:
- `Project URL` → це `NEXT_PUBLIC_SUPABASE_URL`.
- `service_role` секретний ключ (не `anon`!) → це `SUPABASE_SERVICE_ROLE_KEY`.
  Ніколи не потрапляє в клієнтський бандл — лише серверний код
  (`lib/storage.ts`) його використовує.

### pgvector

Нічого вручну вмикати не треба: `prisma/schema.prisma` оголошує
`extensions = [vector, pgTrgm]`, і Prisma сама увімкне обидва розширення
під час `prisma migrate deploy` нижче — постгрес-роль Supabase має на це
права (на відміну від звичайного спільного хостингу).

## 2. Прогнати міграції та seed (локально, проти Supabase)

```bash
cp .env.example .env
```

У `.env` вписати:
- `DATABASE_URL` — прямий рядок підключення з кроку 1
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — з кроку 1
- `SESSION_SECRET` — `openssl rand -base64 32`
- `STAFF_SEED_PASSWORD` — пароль для демо-акаунтів staff-кабінету
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` можна лишити порожнім — код його поки не
  використовує

```bash
npx prisma migrate deploy
npx prisma db seed
```

Перевірити в Supabase **Table Editor**, що таблиці й дані з'явились.

## 3. Викласти код на GitHub

Netlify деплоїть з git-репозиторію:

```bash
git push -u origin main
```

(якщо ще не запушено — `git remote add origin <URL>` перед цим).

## 4. Створити сайт на Netlify

1. https://app.netlify.com/ → **Add new site → Import an existing project**.
2. Обрати GitHub-репозиторій.
3. Netlify сам розпізнає Next.js і підхопить `netlify.toml`
   (build command `npm run build`, плагін `@netlify/plugin-nextjs`) — нічого
   змінювати в майстрі не треба.

## 5. Змінні середовища на Netlify

**Site configuration → Environment variables** — додати ті самі значення,
що й у локальному `.env` з кроку 2:

| Ключ | Значення |
|---|---|
| `DATABASE_URL` | прямий рядок підключення Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role ключ |
| `SESSION_SECRET` | той самий, що й локально (або новий — головне, щоб був сталим між білдами) |
| `STAFF_SEED_PASSWORD` | пароль демо-акаунтів |
| `ANTHROPIC_API_KEY` | опційно — без нього ШІ-консультант працює в mock-режимі |

## 6. Деплой

**Deploys → Trigger deploy → Deploy site** (або він стартує сам одразу
після кроку 4). Дочекатись `Published`.

Перевірка:
- `https://ВАШ-САЙТ.netlify.app` — відкривається публічна головна сторінка
  й мапа
- `/staff/login` — вхід під `admin@prylukymtg.example` / пароль зі
  `STAFF_SEED_PASSWORD`
- Подати тестове звернення на `/zvernennya` з фото → перевірити, що фото
  видно (значить, Supabase Storage підключився), і що звернення з'явилось
  у `/staff/zvernennya`

## 7. Власний домен (опційно)

**Domain management → Add a domain** — Netlify видасть DNS-інструкції
(або CNAME на `ВАШ-САЙТ.netlify.app`, або делегування nameservers). TLS
Netlify видає й продовжує сам, без ручного certbot.

## Оновлення після змін коду

```bash
git push
```

Netlify перебілдовує сайт автоматично на кожен push у гілку, з якою
з'єднано деплой. Нові Prisma-міграції — прогнати вручну ще раз:

```bash
DATABASE_URL="<Session pooler рядок Supabase>" npx prisma migrate deploy
```

(з локальної машини — Netlify Functions не мають доступу для ручних
команд, лише build hook сайту).
