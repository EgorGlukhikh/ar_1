# Академия Риэлторов — LMS Платформа

Профессиональная платформа для обучения риэлторов. Видеокурсы, тесты, домашние задания, живые вебинары, сертификаты и уведомления через MAX Bot.

**Прод:** https://ar1-production.up.railway.app
**Журнал разработки:** https://github.com/EgorGlukhikh/ar_1/issues/1

---

## Стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15 (App Router, TypeScript) |
| UI | shadcn/ui + Tailwind CSS v4 |
| База данных | PostgreSQL + Prisma ORM |
| Авторизация | NextAuth v5 (email/password, роли) |
| Файлы | S3-совместимое хранилище (Yandex Cloud / MinIO) |
| Видео | Собственный плеер (S3, Rutube, Яндекс Диск, YouTube) |
| Вебинары | VideoSDK.live |
| Оплата | Robokassa, T-Bank, Bank 131 |
| Email | Resend |
| Уведомления | MAX Bot (max.ru от VK) |
| Деплой | Railway (nixpacks) |

---

## Роли пользователей

| Роль | Возможности |
|---|---|
| `STUDENT` | Просмотр уроков, тесты, ДЗ, сертификаты, чат |
| `CURATOR` | Проверка домашних заданий, чат со студентами |
| `AUTHOR` | Создание курсов, редактор уроков, аналитика |
| `ADMIN` | Полный доступ: пользователи, курсы, платежи |

---

## Локальный запуск

### 1. Клонировать и установить зависимости

```bash
git clone https://github.com/EgorGlukhikh/ar_1.git
cd ar_1
npm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
```

Заполните `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ar_academy"
AUTH_SECRET="сгенерируйте: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

MAX_BOT_TOKEN="токен бота Академии из max.ru"
VIDEOSDK_API_KEY="ключ из app.videosdk.live"
VIDEOSDK_SECRET="секрет из app.videosdk.live"

# Остальные переменные — по мере необходимости
```

### 3. Применить миграции и запустить

```bash
npx prisma migrate dev
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

---

## Структура проекта

```
app/
  (auth)/         — Вход и регистрация
  (public)/       — Публичные страницы (каталог курсов)
  (student)/      — Личный кабинет студента, обучение, профиль
  (author)/       — Панель автора (курсы, редактор, аналитика)
  (curator)/      — Панель куратора (проверка ДЗ)
  (admin)/        — Панель администратора
  api/            — REST API эндпоинты

components/
  learn/          — Компоненты уроков (quiz, assignment, webinar)
  editor/         — Редактор курсов
  onboarding/     — Онбординг (подключение MAX Bot)
  layout/         — Navbar, общие layout-компоненты
  ui/             — shadcn/ui компоненты

lib/
  prisma.ts       — Prisma клиент
  email.ts        — Email через Resend
  max-bot.ts      — MAX Bot уведомления
  videosdk.ts     — VideoSDK.live интеграция
  certificate-pdf.tsx — Генерация PDF сертификатов
  payments/       — Robokassa, T-Bank, Bank 131

prisma/
  schema.prisma   — Схема базы данных
```

---

## Деплой на Railway

1. Подключить репозиторий в Railway
2. Добавить сервис PostgreSQL
3. Скопировать `DATABASE_URL` из PostgreSQL сервиса
4. Добавить переменные из `.env.example` в Railway Variables
5. Railway автоматически соберёт и задеплоит (`railway.toml`)

Команда запуска: `npx prisma migrate deploy && node .next/standalone/server.js`

---

## MAX Bot

Бот: [@id1800004221_3_bot](https://max.ru/id1800004221_3_bot)

Вебхук зарегистрирован на `https://ar1-production.up.railway.app/api/webhooks/max-bot`.

Студент пишет боту `/start` → получает свой MAX ID → вводит на платформе → начинает получать уведомления о ДЗ, вебинарах и сертификатах.

---

## Лицензия

Proprietary — все права принадлежат Академии Риэлторов.
