import { z } from "zod";
import { count, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { video, series } from "@/lib/db/schema/video";
import { subscription } from "@/lib/db/schema/subscription";
import { getAssignableRoles, type UserRole } from "@/lib/auth/permissions";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
    const [[videoCount], [seriesCount], [userCount], [subCount]] =
      await Promise.all([
        db.select({ value: count() }).from(video),
        db.select({ value: count() }).from(series),
        db.select({ value: count() }).from(user),
        db
          .select({ value: count() })
          .from(subscription)
          .where(eq(subscription.status, "active")),
      ]);

    return {
      totalVideos: videoCount.value,
      totalSeries: seriesCount.value,
      totalUsers: userCount.value,
      activeSubscriptions: subCount.value,
    };
  }),

  listUsers: adminProcedure.query(async () => {
    const rows = await db
      .select()
      .from(user)
      .orderBy(desc(user.createdAt));

    return rows;
  }),

  changeUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "creator", "admin", "superadmin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserRole = ctx.session.user.role as UserRole;

      // Prevent self-modification
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change your own role",
        });
      }

      // Check that the target role is assignable by the current user
      const assignable = getAssignableRoles(currentUserRole);
      if (!assignable.includes(input.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to assign this role",
        });
      }

      // Fetch target user to check their current role
      const [targetUser] = await db
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent modifying users with equal or higher privilege
      const roleHierarchy: Record<string, number> = {
        user: 0,
        creator: 1,
        admin: 2,
        superadmin: 3,
      };
      const currentLevel = roleHierarchy[currentUserRole] ?? 0;
      const targetCurrentLevel = roleHierarchy[targetUser.role ?? "user"] ?? 0;

      if (targetCurrentLevel >= currentLevel) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify a user with equal or higher privileges",
        });
      }

      const [updated] = await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, input.userId))
        .returning();

      return updated;
    }),
});
