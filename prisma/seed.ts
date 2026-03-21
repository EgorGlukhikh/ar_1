import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ──────────────────────────────────
  const adminPassword = await bcrypt.hash("12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "test@mail.ru" },
    update: {},
    create: {
      email: "test@mail.ru",
      name: "Администратор",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ── Categories ──────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Основы риэлторства" },
      update: {},
      create: { name: "Основы риэлторства" },
    }),
    prisma.category.upsert({
      where: { name: "Продажи и переговоры" },
      update: {},
      create: { name: "Продажи и переговоры" },
    }),
    prisma.category.upsert({
      where: { name: "Юридические аспекты" },
      update: {},
      create: { name: "Юридические аспекты" },
    }),
    prisma.category.upsert({
      where: { name: "Ипотека и финансы" },
      update: {},
      create: { name: "Ипотека и финансы" },
    }),
    prisma.category.upsert({
      where: { name: "Маркетинг и реклама" },
      update: {},
      create: { name: "Маркетинг и реклама" },
    }),
    prisma.category.upsert({
      where: { name: "Коммерческая недвижимость" },
      update: {},
      create: { name: "Коммерческая недвижимость" },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // ── Demo course ──────────────────────────────────
  const existingCourse = await prisma.course.findUnique({
    where: { slug: "osnovy-rielторства" },
  });

  if (!existingCourse) {
    const demoCourse = await prisma.course.create({
      data: {
        title: "Основы риэлторства: с нуля до первой сделки",
        slug: "osnovy-rielторства",
        description:
          "Комплексный курс для начинающих риэлторов. Вы узнаете всё необходимое для успешного старта карьеры: от поиска клиентов до закрытия первой сделки.",
        isFree: false,
        price: 9900,
        isPublished: true,
        level: "BEGINNER",
        duration: "12 часов",
        authorId: admin.id,
        categoryId: categories[0].id,
        modules: {
          create: [
            {
              title: "Введение в профессию",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Кто такой риэлтор?",
                    order: 1,
                    type: "VIDEO",
                    isPreview: true,
                    content: "Обзорный урок о профессии риэлтора",
                  },
                  {
                    title: "Рынок недвижимости в России",
                    order: 2,
                    type: "TEXT",
                    content: "Текстовый урок с обзором рынка",
                  },
                ],
              },
            },
            {
              title: "Работа с клиентами",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Первый контакт с покупателем",
                    order: 1,
                    type: "VIDEO",
                  },
                  {
                    title: "Тест: Работа с возражениями",
                    order: 2,
                    type: "QUIZ",
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log("✅ Demo course created:", demoCourse.title);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
