import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import envoiEmail from "../utils/envoiEmail.js";
import { truncate } from "fs";
const prisma = new PrismaClient();



export const listUsersAdminService = async (page, limit) => {
  // Skip/Take pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.admins.count();

  // Get paginated users (only selected fields)
  const users = await prisma.admins.findMany({
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      created_at: true,
    },
  });

  return {
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};


// removed duplicate, incorrect user-block variant

export async function createAdminService({ email, role }) {
  const FRONTEND_URL = process.env.FRONTEND_ADMIN_SIGNUP_URL
  try {

    const existing = await prisma.admins.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: "Un compte admin existe déjà pour cet email3." };
    }

    // Générer un username de base (partie avant @)
    const base = email.split("@")[0]
    let candidate = base
    let admin
    // Tenter la création, et en cas de collision sur username, réessayer avec suffixe
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        admin = await prisma.admins.create({
          data: {
            username: candidate,
            email,
            role: role || "viewer",
          },
        });
        break; // succès
      } catch (errCreate) {
        // Conflit d'unicité
        if (errCreate && errCreate.code === "P2002") {
          const target = Array.isArray(errCreate.meta?.target)
            ? errCreate.meta.target.join(",")
            : errCreate.meta?.target || "unique";
          // Email déjà pris → on sort immédiatement avec message clair
          if (String(target).includes("email")) {
            return { success: false, message: "Un compte admin existe déjà pour cet email." };
          }
          // Username collision → générer un nouveau candidat et réessayer
          if (String(target).includes("username")) {
            const rand = Math.random().toString(36).slice(2, 6)
            candidate = `${base}-${rand}`
            continue
          }
        }
        // Autre erreur → relancer vers le catch externe
        throw errCreate
      }
    }
    if (!admin) {
      return { success: false, message: "Impossible de générer un nom d'utilisateur unique." }
    }

    const token = generateToken({
      adminId: admin.id,
      email,
      role
    }, true); // true pour indique que ce token sera utilser dans un email

    const signupLink = `${FRONTEND_URL}/${encodeURIComponent(token)}`;

    // Contenu de l'email
    const contenuEmail = `
    <h2>Invitation administrateur — Soluxury</h2>
    <p>Un compte administrateur a été préparé pour vous.</p>
    <p>Cliquez sur le lien sécurisé ci-dessous pour finaliser votre inscription (valide 24h) :</p>
    <p><a href="${signupLink}">${signupLink}</a></p>
  `;

    // Envoyer l'email (non bloquant pour le succès métier)
    try {
      await envoiEmail(email, "Invitation administrateur Soluxury — finalisez votre inscription", contenuEmail);
    } catch (emailErr) {
      console.error("❌ Erreur d'envoi email (invitation admin):", emailErr);
      return {
        success: true,
        message: "Admin créé, mais l'email d'invitation n'a pas pu être envoyé.",
        warning: "EMAIL_SENDING_FAILED",
        data: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
      };
    }

    return {
      success: true,
      message: "Admin créé avec succès. Email envoyé.",
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (err) {
    console.error("❌ Erreur createAdminService:", err);
    if (err && err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(",")
        : err.meta?.target || "unique";
      if (String(target).includes("email")) {
        return { success: false, message: "Un compte admin existe déjà pour cet email." };
      }
      if (String(target).includes("username")) {
        return { success: false, message: "Le nom d'utilisateur est déjà utilisé." };
      }
    }
    return {
      success: false,
      message: "Erreur lors de la création de l’admin",
      error: err?.message,
    };
  }
}


export async function signUpService(data) {
  try {
    // Vérifier que l’admin existe
    const admin = await prisma.admins.findUnique({ where: { id: data.id } });
    if (!admin || admin.email !== data.email) {
      return { status: 404, success: false, message: "Admin introuvable" };
    }

    // Hasher le mot de passe
    const hash = await bcrypt.hash(data.password, 10);

    // Mettre à jour l’admin
    await prisma.admins.update({
      where: { id: data.id },
      data: {
        password_hash: hash,
        isActive: true,
        updated_at: new Date()
      }
    });

    return {
      status: 200,
      success: true,
      message: "Inscription finalisée. Vous pouvez maintenant vous connecter."
    };
  } catch (err) {
    console.error("❌ Erreur completeSignup:", err);
    return { status: 500, success: false, message: "Erreur serveur" };
  }
}

export async function updateRole(idAdmin,role){

}

export async function getMyProfileAdmin(userID) {
  try {
    const user = await prisma.admins.findUnique({
      where: { id: userID },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        created_at: true,
        updated_at: true,
        admin_logs: {
          select: {
            id: true,
            action: true,
            entity_id: true,
            details: true,
            created_at: true
          }
        }
      }
    });
    if (!user) {
      return { success: false, message: "User Not found" }
    }
    return { success: true, profile: user };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, message: "Erreur de serveur" }
  }
}


export async function createAdminLog({ admin_id, action, entity_id = null, details = null }) {
  try {
    const log = await prisma.admin_logs.create({
      data: {
        admin_id,
        action,
        entity_id,
        details: typeof details === "object" ? JSON.stringify(details) : details,
      },
    });

    return { success: true, data: log };
  } catch (err) {
    console.error("❌ Erreur createAdminLog:", err);
    return { success: false, message: "Erreur lors de la création du log" };
  }
}


export async function updateAdminRoleService(adminId, newRole) {
  try {
    const existingAdmin = await prisma.admins.findUnique({
      where: { id: Number(adminId) }
    });

    if (!existingAdmin) {
      return {
        success: false,
        message: "Admin introuvable"
      };
    }

    if (existingAdmin.role === newRole) {
      return {
        success: true,
        message: "Le rôle est déjà à jour",
        data: existingAdmin,
        previousRole: existingAdmin.role
      };
    }

    const admin = await prisma.admins.update({
      where: { id: Number(adminId) },
      data: { role: newRole }
    });

    return {
      success: true,
      message: `Rôle de l'admin mis à jour en ${newRole}`,
      data: admin,
      previousRole: existingAdmin.role
    };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        success: false,
        message: "Admin introuvable"
      };
    }
    console.error("❌ Erreur updateAdminRoleService:", error.message);
    return {
      success: false,
      message: "Erreur interne du serveur"
    };
  }
}

export const blockAdminService = async (id) => {
  try {
    // Vérifier si l'admin existe
    const existing = await prisma.admins.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return {
        success: false,
        message: "Admin introuvable",
      };
    }

    // Utiliser isActive comme indicateur d'activation/bloquage: false = bloqué
    const updated = await prisma.admins.update({
      where: { id: Number(id) },
      data: { isActive: !existing.isActive },
    });

    return {
      success: true,
      message: updated.isActive
        ? "✅ Admin débloqué (actif)"
        : "✅ Admin bloqué (inactif)",
    };
  } catch (error) {
    console.error("❌ Error blockAdminService:", error);
    return {
      success: false,
      message: "Erreur base de données",
      error: error.message,
    };
  }
};

// export async function listLogsService(page, limit) {
//   const skip = (page - 1) * limit;
//   const [total, logs] = await Promise.all([
//     prisma.loogs.count(),
//     prisma.loogs.findMany({
//       skip,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       select: {
//         idLog: true,
//         status: true,
//         addIP: true,
//         createdAt: true,
//       },
//     }),
//   ]);
//   return {
//     data: logs,
//     total,
//     page,
//     totalPages: Math.ceil(total / limit),
//   };
// }

export async function getLogByIdService(id) {
  // Ici, 'id' est l'ID de l'admin; on renvoie ses logs
  const logs = await prisma.admin_logs.findMany({
    where: { admin_id: Number(id) },
    orderBy: { created_at: "desc" },
    select: {
      admin_id: true,
      action: true,
      entity_id: true,
      details: true,
      created_at: true,
    },
  });
  return logs;
}
