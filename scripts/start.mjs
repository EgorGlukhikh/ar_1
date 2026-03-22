/**
 * Railway start script — безопасный запуск с фиксом залипших миграций.
 * Запускается вместо голой строки в railway.toml.
 */
import { execSync } from "child_process";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const run = (cmd) => {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

async function fixFailedMigrations() {
  const prisma = new PrismaClient();
  try {
    // Сбрасываем все «залипшие» миграции (started, но не finished)
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations"
      SET "rolled_back_at" = NOW()
      WHERE "finished_at" IS NULL
        AND "started_at"  IS NOT NULL
        AND "rolled_back_at" IS NULL
    `);
    if (result > 0) {
      console.log(`✔ Сброшено залипших миграций: ${result}`);
    }
  } catch (e) {
    // Таблица ещё не существует — нормально для первого деплоя
    console.log("ℹ  _prisma_migrations не найдена — первый деплой, пропускаем");
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  console.log("=== AR Academy start ===");

  await fixFailedMigrations();

  run("npx prisma migrate deploy");
  run("npx prisma db seed");
  run(`npx next start -p ${process.env.PORT ?? 3000}`);
})();
