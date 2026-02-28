import fs from "fs";
import path from "path";
import { Parser } from "json2csv";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 📌 Récupère tous les modèles définis dans ton schéma Prisma
const models = Object.keys(prisma).filter(
  (m) => !m.startsWith("_") && typeof prisma[m].findMany === "function"
);

// Chemin absolu du dossier backups à la racine
const backupsDir = path.resolve("./backups"); // ./ = racine du projet

export const backupDatabase = async () => {
  try {
    // Créer le dossier backups s’il n’existe pas
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    for (const model of models) {
      console.log(`⏳ Export de la table : ${model}...`);

      const data = await prisma[model].findMany();

      if (!data.length) {
        console.log(`⚠️ Table ${model} vide, ignorée.`);
        continue;
      }

      // Convertir JSON → CSV
      const parser = new Parser();
      const csv = parser.parse(data);

      // Nom du fichier : nft_backup_2025-08.csv
      const fileName = `${model}_backup_${new Date()
        .toISOString()
        .slice(0, 7)}.csv`;

      const filePath = path.join(backupsDir, fileName);

      fs.writeFileSync(filePath, csv);
      console.log(`✅ Backup terminé : ${fileName}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du backup :", error);
  } finally {
    await prisma.$disconnect();
  }
};
