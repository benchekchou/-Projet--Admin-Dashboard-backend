import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import envoiEmail from "../utils/envoiEmail.js";
import { truncate } from "fs";
const prisma = new PrismaClient();

export const listUsersService = async (page, limit) => {
  // Skip/Take pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.user.count();

  // Get paginated users (only selected fields)
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" }, // optional, if you have createdAt
    include: {
      pack_purchases: true,
      user_rewards: true,
      wallet: true
    },
  });

  return {
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export async function getNFTsUsers(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
    if (!user)
      return { succes: false, message: "user not found" }
    else {
      const nftsUser = await prisma.nft.findMany({
        where: {
          ownerWallet: {
            in: user.wallet.map((w) => w.address),
          },
        },
      });
      return { succes: true, nftsUser }
    }

  } catch (error) {
    return { succes: false, message: "erreur Serveur" }
  }
}

export async function getUserDetails(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true, // tous les wallets de l’utilisateur
        pack_purchases: {
          include: {
            packs: {
              include: {
                pack_contents: true, // contenu du pack
              },
            },
          },
        },
        user_slots: {
          include: {
            order: true,
          },
        },
        user_rewards: true,
      },
    });

    if (!user) {
      return { succes: false, message: "user not found" }
    }

    // Récupérer aussi les NFTs liés via ownerWallet
    const nfts = await prisma.nft.findMany({
      where: {
        ownerWallet: {
          in: user.wallet.map((w) => w.address),
        },
      },
    });
    const allDetailUser = {
      ...user,
      nfts
    }
    return {
      succes: true,
      allDetailUser
    };
  } catch (err) {
    console.error("Erreur getUserDetails:", err);
    return { success: false, message: "Erreur Serveur" }
  }
}


export const blockUserService = async (id) => {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Toggle isBlock
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlock: !existing.isBlock }
    });

    return {
      success: true,
      message: updated.isBlock
        ? "✅ User has been blocked"
        : "✅ User has been unblocked"
    };
  } catch (error) {
    console.error("❌ Error blockUserService:", error);
    return {
      success: false,
      message: "Database error",
      error: error.message,
    };
  }
};

// export async function createAdminService({ email, role }) {
//   const FRONTEND_URL = process.env.FRONTEND_ADMIN_SIGNUP_URL
//   try {

//     const existing = await prisma.admins.findUnique({ where: { email } });
//     if (existing) {
//       return { success: false, message: "Un compte admin existe déjà pour cet email." };
//     }

//     // Créer un username par défaut (avant @)
//     const username = email.split("@")[0]

//     // Enregistrer l’admin en BDD
//     const admin = await prisma.admins.create({
//       data: {
//         username,
//         email,
//         role: role || "viewer",
//       },
//     });

//     const token = generateToken({
//       adminId: admin.id,
//       email,
//       role
//     }, true); // true pour indique que ce token sera utilser dans un email

//     const signupLink = `${FRONTEND_URL}/${encodeURIComponent(token)}`;

//     // Contenu de l'email
//     const contenuEmail = `
//     <h2>Invitation administrateur — Soluxury</h2>
//     <p>Un compte administrateur a été préparé pour vous.</p>
//     <p>Cliquez sur le lien sécurisé ci-dessous pour finaliser votre inscription (valide 24h) :</p>
//     <p><a href="${signupLink}">${signupLink}</a></p>
//   `;

//     // Envoyer l'email
//     await envoiEmail(email, "Invitation administrateur Soluxury — finalisez votre inscription", contenuEmail);

//     return {
//       success: true,
//       message: "Admin créé avec succès. Email envoyé.",
//       data: {
//         id: admin.id,
//         email: admin.email,
//         role: admin.role,
//       },
//     };
//   } catch (err) {
//     console.error("❌ Erreur createAdminService:", err);
//     return {
//       success: false,
//       message: "Erreur lors de la création de l’admin",
//     };
//   }
// }


// export async function signUpService(data) {
//   try {
//     // Vérifier que l’admin existe
//     const admin = await prisma.admins.findUnique({ where: { id: data.id } });
//     if (!admin || admin.email !== data.email) {
//       return { status: 404, success: false, message: "Admin introuvable" };
//     }

//     // Hasher le mot de passe
//     const hash = await bcrypt.hash(data.password, 10);

//     // Mettre à jour l’admin
//     await prisma.admins.update({
//       where: { id: data.id },
//       data: {
//         password_hash: hash,
//         isActive: true,
//         updated_at: new Date()
//       }
//     });

//     return {
//       status: 200,
//       success: true,
//       message: "Inscription finalisée. Vous pouvez maintenant vous connecter."
//     };
//   } catch (err) {
//     console.error("❌ Erreur completeSignup:", err);
//     return { status: 500, success: false, message: "Erreur serveur" };
//   }
// }

// export async function updateRole(idAdmin,role){

// }

// export async function getMyProfileAdmin(userID) {
//   try {
//     const user = await prisma.admins.findUnique({
//       where: { id: userID },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         role: true,
//         isActive: true,
//         created_at: true,
//         updated_at: true,
//         admin_logs: {
//           select: {
//             id: true,
//             action: true,
//             entity_id: true,
//             details: true,
//             created_at: true
//           }
//         }
//       }
//     });
//     if (!user) {
//       return { success: false, message: "User Not found" }
//     }
//     return { success: true, profile: user };
//   } catch (error) {
//     console.error("Error getting user profile:", error);
//     return { success: false, message: "Erreur de serveur" }
//   }
// }


// export async function createAdminLog({ admin_id, action, entity_id = null, details = null }) {
//   try {
//     const log = await prisma.admin_logs.create({
//       data: {
//         admin_id,
//         action,
//         entity_id,
//         details: typeof details === "object" ? JSON.stringify(details) : details,
//       },
//     });

//     return { success: true, data: log };
//   } catch (err) {
//     console.error("❌ Erreur createAdminLog:", err);
//     return { success: false, message: "Erreur lors de la création du log" };
//   }
// }


// export async function updateAdminRoleService(adminId, newRole) {
//   try {
//     const admin = await prisma.admins.update({
//       where: { id: adminId },
//       data: { role: newRole }
//     });

//     return {
//       success: true,
//       message: `Rôle de l’admin mis à jour en ${newRole}`,
//       data: admin
//     };
//   } catch (error) {
//     if (error.code === "P2025") {
//       return {
//         success: false,
//         message: "Admin introuvable"
//       };
//     }
//     console.error("❌ Erreur updateAdminRoleService:", error.message);
//     return {
//       success: false,
//       message: "Erreur interne du serveur"
//     };
//   }
// }