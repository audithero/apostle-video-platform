import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  video: ["create", "read", "update", "delete"],
  series: ["create", "read", "update", "delete"],
  comment: ["create", "read", "delete", "moderate"],
  subscription: ["read", "manage"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
  video: ["read"],
  series: ["read"],
  comment: ["create", "read"],
  subscription: ["read"],
});

export const admin = ac.newRole({
  video: ["create", "read", "update", "delete"],
  series: ["create", "read", "update", "delete"],
  comment: ["create", "read", "delete", "moderate"],
  subscription: ["read", "manage"],
  ...adminAc.statements,
});

export { ac };

export type UserRole = "user" | "admin";

export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}
