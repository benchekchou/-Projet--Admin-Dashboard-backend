import { PrismaClient } from "@prisma/client";
import envoiEmail from "../utils/envoiEmail.js";

const prisma = new PrismaClient();

// Récupérer l'email vérifié d'un utilisateur à partir du wallet
const getUserEmailByWallet = async (walletAddress) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
      include: { user: true },
    });

    if (!wallet?.user?.email || !wallet.user.emailVerifiedAt) {
      console.log("❌ Email non vérifié ou absent pour ce wallet");
      return null;
    }

    return wallet.user.email;
  } catch (err) {
    console.error("❌ Erreur dans getUserEmailByWallet :", err);
    return null;
  }
};

// Vérifie les connexions multiples et envoie un email si nécessaire
export const checkMultipleIP = async (wallet, ip) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Récupérer toutes les connexions du wallet dans les 5 dernières minutes
    const recentConnections = await prisma.wallet_connections.findMany({
      where: {
        wallet,
        created_at: { gte: fiveMinutesAgo },
        NOT: { ip },
      },
    });

    // Créer la connexion actuelle
    const connection = await prisma.wallet_connections.create({
      data: { wallet, ip, status: "pending" },
    });

    // Si IP différente détectée, envoyer alerte
    if (recentConnections.length > 0) {
      const email = await getUserEmailByWallet(wallet);
      if (email) {
        await alertMultipleIPEmail({ email, wallet, currentIP: ip, alertId: connection.id });
        console.log("⚠️ Alerte envoyée pour wallet :", wallet);
      }
    }

  } catch (err) {
    console.error("❌ Erreur dans checkMultipleIP :", err);
  }
};

// Envoi d'un email d'alerte avec boutons Oui/Non
export const alertMultipleIPEmail = async ({ email, wallet, currentIP, alertId }) => {
  try {
    const logoLink = "https://soluxury.com/logo.png";
    const yesLink = `http://localhost:5000/confirm-connection/${alertId}?action=yes`;
    const noLink = `http://localhost:5000/confirm-connection/${alertId}?action=no`;

    const contenu = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px solid #e0e0e0;">
        <div style="text-align: center;">
          <img src="${logoLink}" alt="Logo Soluxury" style="width: 120px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #e74c3c;">⚠️ Alerte de sécurité</h2>
        <p style="font-size: 16px; color: #555;">
          Votre wallet <strong>${wallet}</strong> a été utilisé depuis une nouvelle adresse IP : <strong>${currentIP}</strong>.
        </p>
        <p style="font-size: 16px; color: #555;">Est-ce vraiment vous ?</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${yesLink}" style="background-color: #2e86de; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; margin-right:10px;">
            Oui
          </a>
          <a href="${noLink}" style="background-color: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Non
          </a>
        </div>
      </div>
    `;

    await envoiEmail(email, "⚠️ Alerte de sécurité sur votre wallet", contenu);
    console.log("✅ Email d'alerte envoyé à :", email);

  } catch (err) {
    console.error("❌ Erreur lors de l'envoi de l'email :", err);
  }
};

// Service de confirmation via le lien Oui/Non
export async function confirmationAlertService(alertId, action) {
  try {
    const alert = await prisma.wallet_connections.findUnique({ where: { id: parseInt(alertId) } });
    if (!alert) return "not_found";

    if (action === "yes") {
      await prisma.wallet_connections.update({ where: { id: alert.id }, data: { status: "approved" } });
      return "approved";
    } else if (action === "no") {
      await prisma.wallet_connections.update({ where: { id: alert.id }, data: { status: "blocked" } });
      return "blocked";
    } else {
      return "invalid";
    }

  } catch (err) {
    console.error("❌ Erreur dans confirmationAlertService :", err);
    throw err;
  }
}
