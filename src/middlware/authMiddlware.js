import { verifyToken } from "../utils/jwt.js";

/**
 * Canonical list of roles recognised by the administration backend.
 */
export const ADMIN_ROLES = Object.freeze(["superadmin", "admin", "manager", "viewer"]);

/**
 * Centralised permission groups that mirror the product matrix.
 */
export const ROLE_PERMISSIONS = Object.freeze({
  PACK_WRITE: ["superadmin", "admin"],
  PACK_READ: ADMIN_ROLES,
  PACK_CONTENT_WRITE: ["superadmin", "admin"],
  SLOT_WRITE: ["superadmin", "admin"],
  SLOT_READ: ADMIN_ROLES,
  USER_READ: ADMIN_ROLES, // view-only access for manager/viewer is enforced by using READ scope only
  USER_WRITE: ["superadmin", "admin"],
  REWARD_MANAGE: ["superadmin", "admin"],
  MEDIA_WRITE: ["superadmin", "admin", "manager"],
  MEDIA_READ: ADMIN_ROLES,
  STATS_ACCESS: ADMIN_ROLES,
  ADMIN_MANAGE: ["superadmin"],
  LOGS_VIEW: ["superadmin"],
});

const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : undefined;

/**
 * Verifies that the requester is authenticated and attaches the decoded payload to `req.info`.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader =
    req.headers?.authorization || req.headers?.Authorization || req.headers?.AUTHORIZATION;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    const decoded = verifyToken(token);
    const normalizedRole = normalizeRole(decoded?.role);

    req.info = {
      ...decoded,
      role: normalizedRole,
      normalizedRole,
    };

    return next();
  } catch (err) {
    console.error("❌ Auth error:", err?.message || err);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};

const toAllowedRoles = (roles) => {
  if (!roles || (Array.isArray(roles) && roles.length === 0)) {
    return ADMIN_ROLES;
  }

  if (Array.isArray(roles)) {
    return roles.map((role) => normalizeRole(role)).filter(Boolean);
  }

  return [normalizeRole(roles)].filter(Boolean);
};

/**
 * Ensures the requester owns one of the authorised roles. Must be placed **after** authMiddleware.
 */
export const authorizeRoles = (...rolesInput) => {
  const allowedRoles = toAllowedRoles(
    rolesInput.length === 1 && Array.isArray(rolesInput[0]) ? rolesInput[0] : rolesInput
  );

  return (req, res, next) => {
    if (!req.info) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const requesterRole = normalizeRole(req.info.role);

    if (!requesterRole) {
      return res.status(403).json({ message: "Rôle administrateur requis" });
    }

    if (!allowedRoles.includes(requesterRole)) {
      return res.status(403).json({ message: "Accès interdit pour ce rôle" });
    }

    return next();
  };
};
