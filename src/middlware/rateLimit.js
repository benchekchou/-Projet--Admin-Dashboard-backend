
import {
  addBlockedIP,
  addBlockedAccount,
  addBlockedSubnet,
  isBlocked,
} from "../utils/blockList.js"
import { getClientIp } from "../utils/getClientIp.js";

const requestsLog = new Map(); // key = ip_account, value = array timestamps
const subnetLog = new Map();   // key = subnet, value = Set(accounts)

const LIMIT = 10; // requêtes max
const WINDOW = 5 * 60 * 1000; // 5 minutes


export const rateLimit = (req, res, next) => {
  const ip =getClientIp(req)
  const account = req?.info?.address || "routePublic"
  const subnet = ip.split(".").slice(0, 3).join(".") + ".";
  console.log({ip,account,subnet})
  // Vérifie si déjà bloqué
  if (isBlocked(ip, account)) {
    console.log("Vous êtes temporairement bloqué pour abus 🚫")
    return res.status(429).json({
      success: false,
      message: "Vous êtes temporairement bloqué pour abus 🚫",
    });
  }

  const now = Date.now();

  // ----- 1. Vérification IP + compte -----
  const key = `${ip}_${account}`;
  if (!requestsLog.has(key)) requestsLog.set(key, []);
  const timestamps = requestsLog.get(key);

  // Garder que les requêtes dans la fenêtre
  const recent = timestamps.filter((t) => now - t < WINDOW);
  recent.push(now);
  requestsLog.set(key, recent);

  if (recent.length > LIMIT) {
    addBlockedIP(ip);
    addBlockedAccount(account);
    console.log("IP et compte bloqués (trop de requêtes en 5min")
    return res.status(429).json({
      success: false,
      message: "IP et compte bloqués (trop de requêtes en 5min)",
    });
  }

  // ----- 2. Vérification sous-réseau -----
  if (!subnetLog.has(subnet)) subnetLog.set(subnet, new Set());
  subnetLog.get(subnet).add(account);

  if (subnetLog.get(subnet).size > 3) { // plus de 3 comptes différents
    addBlockedSubnet(subnet);
    addBlockedAccount(account)
    console.log(`Sous-réseau ${subnet} bloqué (abus multi-comptes)`)
    return res.status(429).json({
      success: false,
      message: `Sous-réseau ${subnet} bloqué (abus multi-comptes)`,
    });
  }
  next();
};
