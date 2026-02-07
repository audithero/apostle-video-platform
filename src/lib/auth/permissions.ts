import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  video: ["create", "read", "update", "delete"],
  series: ["create", "read", "update", "delete"],
  comment: ["create", "read", "delete", "moderate"],
  subscription: ["read", "manage"],
  course: ["create", "read", "update", "delete"],
  community: ["create", "read", "update", "delete", "moderate"],
  email: ["create", "read", "send"],
  analytics: ["read"],
  billing: ["read", "manage"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
  video: ["read"],
  series: ["read"],
  comment: ["create", "read"],
  subscription: ["read"],
  course: ["read"],
  community: ["create", "read"],
  email: [],
  analytics: [],
  billing: [],
});

export const creatorRole = ac.newRole({
  video: ["create", "read", "update", "delete"],
  series: ["create", "read", "update", "delete"],
  comment: ["create", "read", "delete", "moderate"],
  subscription: ["read", "manage"],
  course: ["create", "read", "update", "delete"],
  community: ["create", "read", "update", "delete", "moderate"],
  email: ["create", "read", "send"],
  analytics: ["read"],
  billing: ["read", "manage"],
});

export const admin = ac.newRole({
  video: ["create", "read", "update", "delete"],
  series: ["create", "read", "update", "delete"],
  comment: ["create", "read", "delete", "moderate"],
  subscription: ["read", "manage"],
  course: ["create", "read", "update", "delete"],
  community: ["create", "read", "update", "delete", "moderate"],
  email: ["create", "read", "send"],
  analytics: ["read"],
  billing: ["read", "manage"],
  ...adminAc.statements,
});

export { ac };

export type UserRole = "user" | "admin" | "creator" | "superadmin";

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

export function isCreator(role: string | null | undefined): boolean {
  return role === "creator" || role === "admin" || role === "superadmin";
}

type ResourceType = keyof typeof statement;
type ActionType = (typeof statement)[keyof typeof statement][number];

export function hasPermission(
  role: UserRole,
  resource: ResourceType,
  action: ActionType,
): boolean {
  if (role === "admin" || role === "superadmin") return true;
  if (role === "creator") {
    const allowed = (creatorRole.statements as Record<string, readonly string[]>)[resource];
    return Array.isArray(allowed) && allowed.includes(action);
  }
  const allowed = (user.statements as Record<string, readonly string[]>)[resource];
  return Array.isArray(allowed) && allowed.includes(action);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canBanUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canDeleteUsers(role: UserRole): boolean {
  return role === "superadmin";
}

export function canImpersonateUsers(role: UserRole): boolean {
  return role === "superadmin";
}

export function canSetUserRoles(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canCreateUsers(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canManageOrganizations(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function canManageBilling(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function getAssignableRoles(currentRole: UserRole): UserRole[] {
  if (currentRole === "superadmin") return ["user", "creator", "admin", "superadmin"];
  if (currentRole === "admin") return ["user", "creator", "admin"];
  return [];
}
