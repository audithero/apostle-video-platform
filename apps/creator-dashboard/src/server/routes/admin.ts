import { z } from "zod";
import { count, eq, desc } from "drizzle-orm";
import { createTRPCRouter, adminProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { video, series } from "@/lib/db/schema/video";
import { subscription } from "@/lib/db/schema/subscription";

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
        role: z.enum(["user", "creator", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, input.userId))
        .returning();

      return updated;
    }),
});
