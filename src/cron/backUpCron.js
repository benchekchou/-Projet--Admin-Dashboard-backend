// src/cron/backup.cron.js
import cron from "node-cron";
import { backupDatabase } from "../services/dbBackup.js";

// 📌  (chaque début du mois à minuit) : 0 0 1 * * 

cron.schedule("0 0 1 * *", () => {
  console.log("⏳ Début du backup mensuel...");
  backupDatabase();
});
