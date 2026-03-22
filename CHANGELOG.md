# Changelog — AR Academy LMS

Хронология разработки платформы. Все даты — по UTC+3 (Москва).

---

## 2026-03-22 (блок-редактор)

### feat: редактор блока `/author/.../blocks/[blockId]`
- Новая страница и компонент `BlockEditor` для редактирования любого типа блока
- **VIDEO**: выбор источника (YouTube/Rutube/ЯД/Vimeo/Mux), URL, предпросмотр,
  субтитры через Groq Whisper AI (кнопка «Создать / Пересоздать»)
- **TEXT**: rich-text редактор содержимого
- **ASSIGNMENT**: rich-text описание задания для студентов
- **QUIZ**: заглушка (редактор тестов в разработке)
- **WEBINAR**: URL трансляции + rich-text описание
- Sidebar: `isPreview` switch + кнопка «Сохранить блок»
- `GET /api/blocks/[id]` — новый endpoint загрузки блока
- `lesson-editor.tsx`: упрощён — только название урока + isPreview,
  убраны legacy video/text поля (контент теперь в блоках)

---

## 2026-03-22 (продолжение сессии)

### fix: выход из портала (разлогин)
- Заменён `window.location.href = "/api/auth/signout"` (GET, вызывал client-side exception)
  на `signOut({ callbackUrl: "/landing" })` из `next-auth/react`
- После выхода пользователь попадает на `/landing`

### fix: Railway — зависшие миграции (Deployment failed loop)
- Все SQL-миграции приведены к идемпотентному виду:
  `ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`,
  `ADD CONSTRAINT` обёрнут в `DO $$ BEGIN...EXCEPTION WHEN duplicate_object END $$`
- `railway.toml`: перед `prisma migrate deploy` добавлен
  `prisma migrate resolve --rolled-back` для каждой миграции —
  сбрасывает `failed`-флаг при повторном деплое

### feat: иерархия Курс → Модули → Уроки → Блоки (UX-рефакторинг)
- Кнопка «Добавить урок» в модуле → «Добавить блок»
- При клике открывается picker с карточками типов блоков:
  Видео / Текст / Тест / Задание / Вебинар
- Выбор типа → автосоздание урока-контейнера + блок внутрь
- `AddBlockModal`: карточки с цветными иконками в кружках,
  hover-эффект `-translate-y-0.5`, галочка при выборе,
  поле названия появляется после выбора типа

---

## 2026-03-22

### feat: бесплатные субтитры через Groq Whisper AI
- Новый endpoint `POST /api/lessons/[id]/transcribe` — скачивает видео (до 25 МБ),
  отправляет в Groq `whisper-large-v3`, конвертирует `verbose_json` → WebVTT,
  сохраняет в `lesson.subtitles`; `DELETE` — очищает субтитры
- Миграция: `ALTER TABLE Lesson ADD COLUMN subtitles TEXT`
- `VideoPlayer`: принимает `subtitles` prop → blob URL для `<track kind="subtitles">`,
  поддерживается для native `<video>` и MuxPlayer
- `LessonEditor`: кнопка «Создать субтитры (Whisper)» с индикатором статуса,
  возможность пересоздания и удаления
- Требует: `GROQ_API_KEY` в `.env` (бесплатно на console.groq.com, 2 ч аудио/день)
- Не поддерживается для YouTube / Rutube / Vimeo / Яндекс Диск

### feat: аналитика поведения студентов на видео
- Новая модель `LessonEvent` (play / pause / seek / ended / heartbeat / visibility_hidden)
- Hook `useVideoAnalytics` — трекинг через события плеера + Page Visibility API
  + `keepalive: true` для отправки при закрытии вкладки
- Endpoint `POST /api/analytics/events` — батч-вставка событий
- Endpoint `GET /api/analytics/lessons/[lessonId]` — агрегат: `totalViewers`,
  `avgWatchPercent`, `dropOffBuckets` (кривая охвата), `dropOffBars` (гистограмма)
- Страница `/admin/analytics` — по каждому курсу/уроку: ср. % просмотра,
  drop-off badge (🟢/🟡🔴), кнопка «Детали»
- Компонент `LessonDropoffChart` — фиолетовая кривая охвата + красная гистограмма
  выходов, CSS-бары с hover-тултипами

### feat: предпросмотр портала от имени роли (Role Preview)
- Cookie `admin_preview_role` (httpOnly: false) — admin видит портал глазами
  STUDENT / AUTHOR / CURATOR без выхода из аккаунта
- `RolePreviewBanner` — плавающая таблетка внизу справа, смена роли через dropdown
- `RolePreviewSwitcher` — inline-переключатель на дашборде администратора
- Middleware прокидывает `is_admin_session=1` — admin всегда проходит через
  защищённые маршруты, даже в режиме превью

### feat: система кошелька (баланс пользователя)
- Поле `balance Float @default(0)` на модели `User`
- `POST /api/admin/users/[id]/balance` — пополнение/списание баланса администратором
- `AddBalanceButton` — инлайн-панель с пресетами 500 / 1 000 / 3 000 / 5 000 / 10 000 ₽
- При записи на платный курс: сначала проверяется баланс, если хватает — списание
  через `$transaction`, оплата через внешний шлюз не требуется
- `EnrollButton`: показывает текущий баланс, сообщение «недостаточно средств»
- Дашборд студента: 4-я карточка «Баланс»
- Страница `/admin/users`: отображает баланс каждого студента

### feat: тёмная тема (light / dark / system)
- `next-themes` — `ThemeProvider` оборачивает root layout
- `ThemeToggle` — три кнопки ☀️ 🌙 💻 в навбаре
- Все хардкодированные серые цвета в навбаре заменены на `bg-background`,
  `bg-popover`, семантические токены

### feat: вебинары как тип курса (не урок)
- `CourseType` enum: `COURSE | WEBINAR`
- Отдельная модель `CourseWebinar` + `WebinarAttendance`
- Старые API `/api/webinars/...` заменены stub'ами 410 Gone
- Страница каталога фильтрует вебинары отдельно
- Список вебинаров с датой/временем, бесплатные записываются автоматически

### fix: mobile responsive
- Мобильный сайдбар на всех layout'ах (студент / автор / куратор / админ)
- Лендинг адаптирован под мобильные
- Страница урока: `pb-28` на мобиле для кнопки «Завершить»

---

## 2026-03-21

### feat: начальная инициализация LMS-платформы
- Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- Prisma ORM + PostgreSQL (Railway)
- NextAuth v5: email/password + роли STUDENT / CURATOR / AUTHOR / ADMIN
- Базовые модели: User, Course, Module, Lesson, Enrollment, LessonProgress,
  Quiz, Assignment, Submission, Payment, Certificate
- Роутинг: публичный (лендинг, каталог, страница курса), студент, автор, куратор, админ
- Видеоплеер: UPLOAD (Mux), YouTube, Rutube, Яндекс Диск, Vimeo
- Редактор курса: модули + уроки (drag-and-drop порядок)
- Rich-text редактор (TipTap) для контента уроков
- Тесты (Quiz) с автопроверкой
- Домашние задания (Assignment) с отправкой файла/текста
- Проверка ДЗ куратором: одобрить / отклонить + комментарий
- Каталог курсов с фильтрацией
- Прогресс студента + кнопка «Завершить урок»
- Страница администратора: пользователи, курсы, платежи
- Деплой на Railway, автомиграции через `prisma migrate deploy`
