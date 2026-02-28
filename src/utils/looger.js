// utils/logger.js
import winston from "winston";
import PrismaTransport from "../services/loogerService.js";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new PrismaTransport(), // 🚀 ajout transport DB
  ],
});

export default logger;
