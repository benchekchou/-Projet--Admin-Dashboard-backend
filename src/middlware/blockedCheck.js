import { getClientIp } from "../utils/getClientIp.js";
import logger from "../utils/looger.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function blockedCheck(wallet, ip) {
  
  const blocked = await prisma.wallet_connections.findFirst({
    where: {
      wallet,
      ip,
      status: "blocked",
    },
  });

  return !!blocked; // true si bloqué encore actif
}

export const blockedCheckMiddleware = async (req, res, next) => {
  const ip =getClientIp(req)
  const wallet = req?.info?.address || "routePublic"
    try {

        const isBlocked = await blockedCheck(wallet,ip)

        if (isBlocked) {
            await logger.warn(`Tentative d'accès bloquée pour wallet ${wallet} depuis IP ${ip}`);
            return res.status(403).json({ message: "Accès bloqué : connexion suspecte détectée" });
        }
        next();
    } catch (err) {
        await logger.error(`Erreur de vérification du token: ${err.message}`, { ip });
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};
