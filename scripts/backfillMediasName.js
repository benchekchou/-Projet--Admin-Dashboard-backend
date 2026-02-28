// Backfill medias.name from URL filename or fallback
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function deriveNameFromUrl(url, id) {
  if (!url || typeof url !== "string") return `media-${id}`;
  const last = url.split("/").pop();
  if (last && last.trim()) return last.trim();
  return `media-${id}`;
}

async function main() {
  const rows = await prisma.medias.findMany({ select: { id: true, url: true, name: true } });
  let updated = 0;
  for (const r of rows) {
    if (!r.name || !String(r.name).trim()) {
      const derived = deriveNameFromUrl(r.url, r.id);
      await prisma.medias.update({ where: { id: r.id }, data: { name: derived } });
      updated += 1;
    }
  }
  console.log(`Backfilled ${updated} rows`);
}

main()
  .catch((e) => {
    console.error("Backfill error", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


