# Деплой на HOSTiQ Cloud VPS (демо)

Покроковий runbook. Виконується на VPS через SSH — команди нижче
копіюються як є.

## 1. Замовити VPS на hostiq.ua

1. https://hostiq.ua/cloud-vps/ → тариф **22 units (2 GB RAM / 1 CPU / 10 GB)**
   достатньо для демо.
2. Образ — **Ubuntu 22.04** (не готовий шаблон "Docker", щоб контролювати
   версію самостійно — ставимо Docker вручну нижче, це 3 команди).
3. Отримати в кабінеті: IP-адресу сервера, root-пароль (або завантажити
   SSH-ключ, якщо пропонували його на етапі створення).

## 2. Перше підключення й базове налаштування

```bash
ssh root@ВАШ_IP
apt update && apt upgrade -y
```

## 3. Встановити Docker

```bash
curl -fsSL https://get.docker.com | sh
```

Перевірка: `docker --version` і `docker compose version` мають вивести версії.

## 4. Завантажити код на сервер

Найпростіше — git clone (якщо репозиторій приватний, спершу
`ssh-keygen -t ed25519` на сервері й додати публічний ключ у GitHub/GitLab
Deploy Keys):

```bash
apt install -y git
git clone <URL_ВАШОГО_РЕПОЗИТОРІЮ> /opt/chysti-prylyky
cd /opt/chysti-prylyky
```

## 5. Налаштувати змінні середовища

```bash
cp .env.production.example .env.production
nano .env.production
```

Обов'язково змінити:
- `POSTGRES_PASSWORD` і відповідну частину в `DATABASE_URL` (мають
  збігатися)
- `SESSION_SECRET` — згенерувати: `openssl rand -base64 32`
- `STAFF_SEED_PASSWORD` — пароль для демо-акаунтів staff-кабінету

## 6. Зібрати й підняти контейнери

```bash
docker compose build
docker compose up -d
docker compose ps
```

Обидва сервіси (`db`, `app`) мають бути `running`/`healthy`.

## 7. Міграції та наповнення демо-даними

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Перевірка без домену ще (з самого сервера):

```bash
curl -I http://127.0.0.1:3000
```

Має повернути `HTTP/1.1 200 OK`.

## 8. DNS

У панелі керування доменом (реєстратор або hostiq, якщо домен теж там)
додати A-запис на IP сервера — або на кореневий домен, якщо він вільний,
або на піддомен (`chp.вашдомен.ua` чи подібний), якщо кореневий домен
зайнятий чинним WordPress-сайтом громади:

```
A    chp    ВАШ_IP    (TTL 300)
```

DNS може розповсюджуватись до ~30 хв.

## 9. Nginx + TLS

```bash
apt install -y nginx certbot python3-certbot-nginx
cp deploy/nginx.conf /etc/nginx/sites-available/chysti-prylyky.conf
sed -i 's/YOUR_DOMAIN/chp.вашдомен.ua/' /etc/nginx/sites-available/chysti-prylyky.conf
ln -s /etc/nginx/sites-available/chysti-prylyky.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d chp.вашдомен.ua
```

Certbot сам допише HTTPS-блок і налаштує автопродовження сертифіката.

## 10. Фінальна перевірка

- https://chp.вашдомен.ua — відкривається публічна головна сторінка й мапа
- https://chp.вашдомен.ua/staff/login — вхід під `admin@prylukymtg.example`
  / пароль зі `STAFF_SEED_PASSWORD`
- Подати тестове звернення на `/zvernennya`, перевірити, що воно з'явилось
  у `/staff/zvernennya`

## Оновлення після змін коду

```bash
cd /opt/chysti-prylyky
git pull
docker compose build app
docker compose up -d app
```

(Нові Prisma-міграції, якщо були, — повторити крок 7, `migrate deploy`
без `db seed`, щоб не затерти демо-дані повторно.)

## Якщо VPS лише на час демонстрації

HOSTiQ Cloud VPS має погодинну оплату — після демо можна видалити сервер
у панелі керування, щоб не платити за простій.
