import { db } from "@/lib/db";
import { courseModule } from "@/lib/db/schema/course";
import { enrollment } from "@/lib/db/schema/enrollment";
import { eq, asc } from "drizzle-orm";

interface DripStatus {
  moduleId: string;
  title: string;
  isAvailable: boolean;
  availableAt: Date | null;
  daysUntilAvailable: number;
}

export async function getModuleDripStatus(
  courseId: string,
  enrollmentId: string,
): Promise<DripStatus[]> {
  const [enroll] = await db
    .select()
    .from(enrollment)
    .where(eq(enrollment.id, enrollmentId))
    .limit(1);

  if (!enroll) return [];

  const modules = await db
    .select()
    .from(courseModule)
    .where(eq(courseModule.courseId, courseId))
    .orderBy(asc(courseModule.sortOrder));

  const now = new Date();
  const enrolledAt = enroll.enrolledAt;

  return modules.map((mod) => {
    // Date-based drip (cohort courses)
    if (mod.dripDate) {
      const isAvailable = now >= mod.dripDate;
      const daysUntil = isAvailable
        ? 0
        : Math.ceil((mod.dripDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        moduleId: mod.id,
        title: mod.title,
        isAvailable,
        availableAt: isAvailable ? null : mod.dripDate,
        daysUntilAvailable: daysUntil,
      };
    }

    // Delay-based drip (self-paced/drip courses)
    const delayDays = mod.dripDelayDays ?? 0;
    if (delayDays === 0) {
      return {
        moduleId: mod.id,
        title: mod.title,
        isAvailable: true,
        availableAt: null,
        daysUntilAvailable: 0,
      };
    }

    const availableAt = new Date(enrolledAt.getTime() + delayDays * 24 * 60 * 60 * 1000);
    const isAvailable = now >= availableAt;
    const daysUntil = isAvailable
      ? 0
      : Math.ceil((availableAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      moduleId: mod.id,
      title: mod.title,
      isAvailable,
      availableAt: isAvailable ? null : availableAt,
      daysUntilAvailable: daysUntil,
    };
  });
}

export function generateDripTimeline(
  modules: Array<{ title: string; dripDelayDays: number | null }>,
): Array<{ title: string; day: number }> {
  return modules.map((mod) => ({
    title: mod.title,
    day: mod.dripDelayDays ?? 0,
  }));
}
