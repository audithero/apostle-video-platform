import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { certificate, course } from "@/lib/db/schema/course";
import { enrollment } from "@/lib/db/schema/enrollment";
import { generateCertificateKey, getPublicUrl } from "@/lib/storage/r2-upload";

export const certificatesRouter = createTRPCRouter({
  // Get certificate config for a course
  getByCourse: creatorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ input }) => {
      const [cert] = await db
        .select()
        .from(certificate)
        .where(eq(certificate.courseId, input.courseId))
        .limit(1);
      return cert ?? null;
    }),

  // Create or update certificate config
  upsert: creatorProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        logoUrl: z.string().optional(),
        backgroundImageUrl: z.string().optional(),
        includeDate: z.boolean().optional(),
        includeSerial: z.boolean().optional(),
        expirationDays: z.number().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(certificate)
        .where(eq(certificate.courseId, input.courseId))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(certificate)
          .set({
            title: input.title,
            subtitle: input.subtitle,
            logoUrl: input.logoUrl,
            backgroundImageUrl: input.backgroundImageUrl,
            includeDate: input.includeDate,
            includeSerial: input.includeSerial,
            expirationDays: input.expirationDays,
          })
          .where(eq(certificate.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(certificate)
        .values({
          courseId: input.courseId,
          title: input.title,
          subtitle: input.subtitle,
          logoUrl: input.logoUrl,
          backgroundImageUrl: input.backgroundImageUrl,
          includeDate: input.includeDate ?? true,
          includeSerial: input.includeSerial ?? true,
          expirationDays: input.expirationDays,
        })
        .returning();
      return created;
    }),

  // Generate certificate for a student (student-facing)
  generate: protectedProcedure
    .input(z.object({ enrollmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify enrollment belongs to user
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.id, input.enrollmentId),
            eq(enrollment.studentId, ctx.session.user.id),
          ),
        )
        .limit(1);

      if (!enroll) {
        throw new Error("Enrollment not found");
      }

      if (!enroll.completedAt) {
        throw new Error("Course not yet completed");
      }

      // Get course + certificate config
      const [courseRecord] = await db
        .select()
        .from(course)
        .where(eq(course.id, enroll.courseId))
        .limit(1);

      if (!courseRecord) {
        throw new Error("Course not found");
      }

      const [certConfig] = await db
        .select()
        .from(certificate)
        .where(eq(certificate.courseId, enroll.courseId))
        .limit(1);

      // Generate serial number
      const serial = `CERT-${courseRecord.id.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Generate the storage key for the certificate PDF
      const storageKey = generateCertificateKey(courseRecord.creatorId, serial);
      const publicUrl = getPublicUrl(storageKey);

      // Update enrollment with certificate info
      await db
        .update(enrollment)
        .set({
          certificatePdfUrl: publicUrl,
          certificateSerial: serial,
          certificateIssuedAt: new Date(),
        })
        .where(eq(enrollment.id, input.enrollmentId));

      return {
        serial,
        url: publicUrl,
        storageKey,
        courseName: courseRecord.title,
        studentName: ctx.session.user.name ?? "Student",
        certConfig: certConfig ?? null,
        completedAt: enroll.completedAt,
      };
    }),

  // Verify a certificate by serial
  verify: protectedProcedure
    .input(z.object({ serial: z.string() }))
    .query(async ({ input }) => {
      const [enroll] = await db
        .select({
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          completedAt: enrollment.completedAt,
          certificateSerial: enrollment.certificateSerial,
          certificateIssuedAt: enrollment.certificateIssuedAt,
        })
        .from(enrollment)
        .where(eq(enrollment.certificateSerial, input.serial))
        .limit(1);

      if (!enroll) {
        return { valid: false as const, message: "Certificate not found" };
      }

      const [courseRecord] = await db
        .select({ title: course.title })
        .from(course)
        .where(eq(course.id, enroll.courseId))
        .limit(1);

      return {
        valid: true as const,
        courseName: courseRecord?.title ?? "Unknown Course",
        completedAt: enroll.completedAt,
        issuedAt: enroll.certificateIssuedAt,
        serial: enroll.certificateSerial,
      };
    }),
});
