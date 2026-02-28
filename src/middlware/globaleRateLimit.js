import { getClientIp } from "../utils/getClientIp.js";
import logger from "../utils/looger.js";

 // ratelimit pour tous les routes (public et privé)
const globalRequestsLog = new Map();
const GLOBAL_LIMIT = 10; // max 100 requêtes
const GLOBAL_WINDOW = 5 * 60 * 1000; // 15 minutes
const BAN_DURATION = 30 * 60 * 1000; // 30 min ban

const globalBlockList = new Map(); // { (key) ip: (value) expiryTimestamp }

export const globalRateLimit = async (req, res, next) => {
  const ip =getClientIp(req)
  // Normalisation IPv6 → IPv4
  let clientIp = ip;
  if (clientIp === "::1" || clientIp === "127.0.0.1") clientIp = "127.0.0.1";
  if (clientIp.startsWith("::ffff:")) clientIp = clientIp.substring(7);

  const now = Date.now();

  // Vérifier si IP est déjà bloquée
  if (globalBlockList.has(clientIp) && globalBlockList.get(clientIp) > now) {
    
    return res.status(429).json({
      success: false,
      message: "Trop de requêtes, votre IP est temporairement bloquée.",
    });
  }

  // Nettoyer les anciennes requêtes
  if (!globalRequestsLog.has(clientIp)) globalRequestsLog.set(clientIp, []);
  const timestamps = globalRequestsLog.get(clientIp);
  const recent = timestamps.filter((t) => now - t < GLOBAL_WINDOW);
  recent.push(now);
  globalRequestsLog.set(clientIp, recent);

  // Vérifier la limite
  if (recent.length > GLOBAL_LIMIT) {
    globalBlockList.set(clientIp, now + BAN_DURATION);
    await logger.error(`Trop de requêtes depuis ${clientIp}. IP bannie pour 30 min.`, { ip: getClientIp(req) });
    return res.status(429).json({
      success: false,
      message: `Trop de requêtes depuis ${clientIp}. IP bannie pour 30 min.`,
    });
  }

  next();
};
