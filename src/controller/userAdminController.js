import { z } from "zod";
import { createAdminService, signUpService,blockAdminService, updateAdminRoleService,  getMyProfileAdmin, createAdminLog, listUsersAdminService,  getLogByIdService } from "../services/usersAdminService.js";

const ADMIN_ROLES = ["superadmin", "admin", "manager", "viewer"];

export const createAdminSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  role: z.enum(["superadmin", "admin", "manager", "viewer"], {
    errorMap: () => ({ message: "Role invalide" }),
  }),
});

const signupSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères")
});


export async function updateUserRoleController(req, res) {
  try {
    const requester = req.info;
    if (!requester || requester.role?.toLowerCase() !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Accès interdit : privilégiez un compte superadmin",
      });
    }

    const { id } = req.params;
    const { role } = req.body || {};

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Identifiant utilisateur invalide",
      });
    }

    if (!role || !ADMIN_ROLES.includes(String(role).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Role invalide",
      });
    }

    const normalizedRole = String(role).toLowerCase();
    const updateResult = await updateAdminRoleService(id, normalizedRole);

    if (!updateResult.success) {
      const status = updateResult.message === "Admin introuvable" ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: updateResult.message,
      });
    }

    const requesterId = requester.id ?? requester.adminId;
    const { password_hash: _removedPassword, ...safeAdmin } = updateResult.data || {};

    if (requesterId) {
      await createAdminLog({
        admin_id: requesterId,
        entity_id: Number(id),
        action: "UPDATE_ADMIN_ROLE",
        details: {
          from: updateResult.previousRole,
          to: normalizedRole,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: updateResult.message,
      data: safeAdmin,
    });
  } catch (err) {
    console.error("Erreur updateUserRoleController:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
}

export async function createAdminController(req, res) {
    try {
  
      const parsed = createAdminSchema.safeParse(req.body);
  
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map(err => err.message),
        });
      }
      const reponse = await createAdminService(parsed.data)
  
      if (reponse.success && req.info?.id)
        await createAdminLog({
          admin_id: req.info.id,
          entity_id : reponse.data.id,
          action: "CREATE_ADMIN",
          details: reponse.success ? { email: parsed.data.email, role: parsed.data.role } : "Failed"
        });
  
      if (reponse.success)
        return res.status(200).json(reponse)
      else {
        // Déterminer le code de statut approprié selon le type d'erreur
        const statusCode = reponse.message.includes("existe déjà") ? 409 : 500;
        return res.status(statusCode).json(reponse)
      }
    } catch (error) {
      console.error("❌ createAdminController error:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
      });
    }
  }

  export async function signupAdminController(req, res) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      console.log(req.body)
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          errors: parsed.error.errors.map(e => e.message)
        });
      }
  
      const { adminId, email } = req.info; // injecté par middleware
      const { password } = parsed.data;
      const reponse = await signUpService({ id: adminId, email, password });
      if (reponse.success)
        await createAdminLog({
          admin_id: adminId,
          action: "SIGNUP_ADMIN",
          details: reponse.success ? "Signup completed" : "Failed signup"
        });
      return res.status(reponse.status).json(reponse)
    } catch (error) {
  
    }
  }

  export async function getMyProfileAdminController(req, res) {
    try {
      const userId = req.info.id;
      const reponse = await getMyProfileAdmin(userId);
      return res.status(reponse.success ? 200 : 500).json(reponse);
    } catch (error) {
      return { success: false, message: 'Erreur de serveur' };
    }
  }

  
export const blockAdminController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await blockAdminService(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error blockUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getLogsController = async (req, res) => {
  try {
    const result = await getLogsService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error getLogs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const listUsersAdminController = async (req, res) => {
  try {
    // Extract pagination params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Call the service to get the users with pagination
    const result = await listUsersAdminService(page, limit);

    return res.status(200).json({
      success: true,
      message: "Admins retrieved successfully",
      ...result,
    });
  } catch (error) {
    console.error("❌ Error listUsersAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// export const listLogsController = async (req, res) => {
//   try {
//     let { page = 1, limit = 20 } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid pagination parameters",
//       });
//     }

//     const result = await listLogsService(page, limit);
//     return res.status(200).json({ success: true, ...result });
//   } catch (error) {
//     console.error("❌ Error listLogsController:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// }

export const getLogByIdAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Admin ID is required" });
    }
    const logs = await getLogByIdService(id);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("❌ Error getLogByIdController:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
