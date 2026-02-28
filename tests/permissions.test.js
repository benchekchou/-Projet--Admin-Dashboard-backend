import express from "express";
import request from "supertest";
import {
  authMiddleware,
  authorizeRoles,
  ROLE_PERMISSIONS,
} from "../src/middlware/authMiddlware.js";
import generateToken from "../src/utils/jwt.js";

process.env.JWT_SECRET = "test-secret";

const ROLES = ["superadmin", "admin", "manager", "viewer"];

const tokens = ROLES.reduce((acc, role) => {
  acc[role] = generateToken({ id: `${role}-id`, email: `${role}@example.com`, role });
  return acc;
}, {});

const callRoute = (permission, role) => {
  const app = express();
  app.get("/protected", authMiddleware, authorizeRoles(permission), (req, res) => {
    res.json({ ok: true, role: req.info.role });
  });

  const agent = request(app).get("/protected");
  if (role) {
    agent.set("Authorization", `Bearer ${tokens[role]}`);
  }
  return agent;
};

describe("Role-based access control matrix", () => {
  test("requires authentication when no token is supplied", async () => {
    const response = await callRoute(ROLE_PERMISSIONS.PACK_WRITE).expect(401);
    expect(response.body).toEqual({ message: "Authentification requise" });
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 403],
    ["viewer", 403],
  ])("PACK_WRITE allows only superadmin/admin (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.PACK_WRITE, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 200],
    ["viewer", 200],
  ])("USER_READ grants read access to all roles (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.USER_READ, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 403],
    ["viewer", 403],
  ])("USER_WRITE limited to superadmin/admin (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.USER_WRITE, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 200],
    ["viewer", 403],
  ])("MEDIA_WRITE excludes viewers (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.MEDIA_WRITE, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 200],
    ["viewer", 200],
  ])("STATS_ACCESS available to every role (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.STATS_ACCESS, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 403],
    ["manager", 403],
    ["viewer", 403],
  ])("ADMIN_MANAGE reserved for superadmin (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.ADMIN_MANAGE, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 200],
    ["manager", 403],
    ["viewer", 403],
  ])("REWARD_MANAGE shared by superadmin/admin only (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.REWARD_MANAGE, role).expect(status);
  });

  test.each([
    ["superadmin", 200],
    ["admin", 403],
    ["manager", 403],
    ["viewer", 403],
  ])("LOGS_VIEW restricted to superadmin (%s)", async (role, status) => {
    await callRoute(ROLE_PERMISSIONS.LOGS_VIEW, role).expect(status);
  });
});
