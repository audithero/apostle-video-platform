/**
 * Seed an admin user for local development.
 *
 * Usage:
 *   bun run scripts/seed-admin.ts
 *
 * Requires DATABASE_URL and other env vars in .env
 */
import { auth } from "../src/lib/auth/auth";
import { db } from "../src/lib/db";
import { user } from "../src/lib/db/schema/auth";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@apostle.tv";
const ADMIN_PASSWORD = "admin123456";
const ADMIN_NAME = "Admin";

async function seedAdmin() {
  // Check if user already exists
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    // Just ensure role is admin
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.email, ADMIN_EMAIL));
    console.log(`User ${ADMIN_EMAIL} already exists — role set to admin.`);
    process.exit(0);
  }

  // Create user via better-auth API
  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
    },
  });

  if (!result) {
    console.error("Failed to create user via auth API.");
    process.exit(1);
  }

  // Promote to admin
  await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.email, ADMIN_EMAIL));

  console.log("Admin user created successfully!");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role:     admin`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
