/**
 * Seed a creator account with sample courses, modules, and lessons.
 *
 * Usage:
 *   bun run scripts/seed-creator.ts
 *
 * Prerequisites: Run seed-admin.ts first.
 * Requires DATABASE_URL and other env vars in .env
 */
import { db } from "../src/lib/db";
import { user } from "../src/lib/db/schema/auth";
import { creator, creatorSettings } from "../src/lib/db/schema/creator";
import { course, courseModule, lesson, quiz, quizQuestion, certificate } from "../src/lib/db/schema/course";
import { communityChannel } from "../src/lib/db/schema/community";
import { creditLedger } from "../src/lib/db/schema/billing";
import { landingPage, emailSequence, emailSequenceStep } from "../src/lib/db/schema/marketing";
import { eq } from "drizzle-orm";

const CREATOR_EMAIL = "admin@apostle.tv";

async function seedCreator() {
  // eslint-disable-next-line no-console
  console.log("Seeding creator profile and sample data...\n");

  // Get the admin user
  const [adminUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, CREATOR_EMAIL))
    .limit(1);

  if (!adminUser) {
    // eslint-disable-next-line no-console
    console.error("Admin user not found. Run seed-admin.ts first.");
    process.exit(1);
  }

  // Update role to creator
  await db
    .update(user)
    .set({ role: "creator" })
    .where(eq(user.id, adminUser.id));

  // Create creator profile
  const [existingCreator] = await db
    .select({ id: creator.id })
    .from(creator)
    .where(eq(creator.userId, adminUser.id))
    .limit(1);

  let creatorId: string;

  if (existingCreator) {
    creatorId = existingCreator.id;
    // eslint-disable-next-line no-console
    console.log("Creator profile already exists, using existing.");
  } else {
    const [newCreator] = await db
      .insert(creator)
      .values({
        userId: adminUser.id,
        businessName: "Apostle Academy",
        slug: "apostle-academy",
        brandColor: "#2563eb",
        timezone: "America/New_York",
        tier: "scale",
      })
      .returning();
    creatorId = newCreator.id;
    // eslint-disable-next-line no-console
    console.log("Created creator profile: Apostle Academy");
  }

  // Create settings
  const [existingSettings] = await db
    .select({ id: creatorSettings.id })
    .from(creatorSettings)
    .where(eq(creatorSettings.creatorId, creatorId))
    .limit(1);

  if (!existingSettings) {
    await db.insert(creatorSettings).values({
      creatorId,
      emailFromName: "Apostle Academy",
      emailReplyTo: "hello@apostle.tv",
    });
  }

  // Create sample courses
  const coursesData = [
    {
      title: "Cinematic Lighting Masterclass",
      slug: "cinematic-lighting",
      description: "Master the art of cinematic lighting for film and video production. Learn 3-point lighting, motivated lighting, and mood creation.",
      status: "published" as const,
      courseType: "self_paced" as const,
      priceType: "paid" as const,
      priceCents: 9900,
      enrollmentCount: 127,
      completionRate: 0.68,
    },
    {
      title: "Documentary Storytelling",
      slug: "documentary-storytelling",
      description: "Learn how to craft compelling documentary narratives from concept to final cut.",
      status: "published" as const,
      courseType: "drip" as const,
      priceType: "paid" as const,
      priceCents: 14900,
      dripIntervalDays: 7,
      enrollmentCount: 84,
      completionRate: 0.45,
    },
    {
      title: "Color Grading Fundamentals",
      slug: "color-grading",
      description: "From basic color correction to advanced grading techniques using DaVinci Resolve.",
      status: "draft" as const,
      courseType: "self_paced" as const,
      priceType: "free" as const,
      enrollmentCount: 0,
    },
  ];

  const courseIds: string[] = [];

  for (const courseData of coursesData) {
    const [existing] = await db
      .select({ id: course.id })
      .from(course)
      .where(eq(course.slug, courseData.slug))
      .limit(1);

    if (existing) {
      courseIds.push(existing.id);
      continue;
    }

    const [newCourse] = await db
      .insert(course)
      .values({ creatorId, ...courseData })
      .returning();
    courseIds.push(newCourse.id);
    // eslint-disable-next-line no-console
    console.log(`  Created course: ${courseData.title}`);
  }

  // Create modules and lessons for the first course
  const courseId = courseIds.at(0);
  if (!courseId) {
    process.exit(0);
  }

  const modulesData = [
    {
      title: "Introduction to Light",
      description: "Understanding the physics and emotion of light in cinema",
      sortOrder: 0,
      lessons: [
        { title: "Why Light Matters", lessonType: "video" as const, sortOrder: 0 },
        { title: "The Science of Color Temperature", lessonType: "text" as const, sortOrder: 1 },
        { title: "Module 1 Quiz", lessonType: "quiz" as const, sortOrder: 2 },
      ],
    },
    {
      title: "Three-Point Lighting",
      description: "The foundation of professional lighting setups",
      sortOrder: 1,
      lessons: [
        { title: "Key Light Placement", lessonType: "video" as const, sortOrder: 0 },
        { title: "Fill and Back Light", lessonType: "video" as const, sortOrder: 1 },
        { title: "Practical Exercise: Portrait Lighting", lessonType: "assignment" as const, sortOrder: 2 },
        { title: "Three-Point Lighting Quiz", lessonType: "quiz" as const, sortOrder: 3 },
      ],
    },
    {
      title: "Motivated Lighting",
      description: "Creating believable lighting that serves the story",
      sortOrder: 2,
      lessons: [
        { title: "What is Motivated Lighting?", lessonType: "video" as const, sortOrder: 0 },
        { title: "Window Light Techniques", lessonType: "video" as const, sortOrder: 1 },
        { title: "Practical Light Sources", lessonType: "text" as const, sortOrder: 2 },
      ],
    },
  ];

  for (const modData of modulesData) {
    const [existingMod] = await db
      .select({ id: courseModule.id })
      .from(courseModule)
      .where(eq(courseModule.title, modData.title))
      .limit(1);

    if (existingMod) continue;

    const [mod] = await db
      .insert(courseModule)
      .values({
        courseId,
        title: modData.title,
        description: modData.description,
        sortOrder: modData.sortOrder,
      })
      .returning();

    for (const lessonData of modData.lessons) {
      const [newLesson] = await db
        .insert(lesson)
        .values({
          moduleId: mod.id,
          courseId,
          title: lessonData.title,
          lessonType: lessonData.lessonType,
          sortOrder: lessonData.sortOrder,
          contentHtml: lessonData.lessonType === "text"
            ? "<p>Sample lesson content. This would contain rich text content edited in the TipTap editor.</p>"
            : null,
        })
        .returning();

      // Create quiz for quiz lessons
      if (lessonData.lessonType === "quiz") {
        const [newQuiz] = await db
          .insert(quiz)
          .values({
            lessonId: newLesson.id,
            title: lessonData.title,
            passingScorePercent: 70,
            maxAttempts: 3,
            timeLimitMinutes: 15,
          })
          .returning();

        // Add sample questions
        await db.insert(quizQuestion).values([
          {
            quizId: newQuiz.id,
            questionText: "What is the primary purpose of a key light?",
            questionType: "multiple_choice",
            options: [
              "To illuminate the subject from the main angle",
              "To fill in shadows",
              "To create a rim around the subject",
              "To light the background",
            ],
            correctAnswer: "To illuminate the subject from the main angle",
            explanation: "The key light is the primary, dominant light source for a scene.",
            sortOrder: 0,
            points: 10,
          },
          {
            quizId: newQuiz.id,
            questionText: "Higher color temperature produces warmer (more orange) light.",
            questionType: "true_false",
            options: ["True", "False"],
            correctAnswer: "False",
            explanation: "Higher color temperature (e.g., 6500K) produces cooler (bluer) light. Lower temperatures produce warmer light.",
            sortOrder: 1,
            points: 5,
          },
        ]);
      }
    }
    // eslint-disable-next-line no-console
    console.log(`  Created module: ${modData.title} (${String(modData.lessons.length)} lessons)`);
  }

  // Create certificate config
  const [existingCert] = await db
    .select({ id: certificate.id })
    .from(certificate)
    .where(eq(certificate.courseId, courseId))
    .limit(1);

  if (!existingCert) {
    await db.insert(certificate).values({
      courseId,
      title: "Certificate of Completion",
      subtitle: "Cinematic Lighting Masterclass",
    });
    // eslint-disable-next-line no-console
    console.log("  Created certificate config");
  }

  // Create community channels
  const channels = [
    { name: "General Discussion", slug: "general", channelType: "discussion" as const, sortOrder: 0 },
    { name: "Show Your Work", slug: "show-your-work", channelType: "discussion" as const, sortOrder: 1 },
    { name: "Announcements", slug: "announcements", channelType: "announcement" as const, sortOrder: 2 },
  ];

  for (const ch of channels) {
    const [existing] = await db
      .select({ id: communityChannel.id })
      .from(communityChannel)
      .where(eq(communityChannel.slug, ch.slug))
      .limit(1);

    if (!existing) {
      await db.insert(communityChannel).values({ creatorId, ...ch });
      // eslint-disable-next-line no-console
      console.log(`  Created channel: ${ch.name}`);
    }
  }

  // Create sample landing page
  const [existingPage] = await db
    .select({ id: landingPage.id })
    .from(landingPage)
    .where(eq(landingPage.slug, "lighting-masterclass"))
    .limit(1);

  if (!existingPage) {
    await db.insert(landingPage).values({
      creatorId,
      title: "Cinematic Lighting Masterclass",
      slug: "lighting-masterclass",
      status: "published",
      blocksJson: [
        {
          type: "hero",
          heading: "Master Cinematic Lighting",
          subheading: "Transform your films with professional lighting techniques",
          ctaText: "Enroll Now",
          ctaUrl: "/courses/cinematic-lighting",
        },
        {
          type: "features",
          heading: "What You Will Learn",
          items: [
            "Three-point lighting setups",
            "Motivated lighting techniques",
            "Color temperature control",
            "Low-budget lighting solutions",
          ],
        },
      ],
    });
    // eslint-disable-next-line no-console
    console.log("  Created landing page: lighting-masterclass");
  }

  // Create sample email sequence
  const [existingSeq] = await db
    .select({ id: emailSequence.id })
    .from(emailSequence)
    .where(eq(emailSequence.name, "Welcome Series"))
    .limit(1);

  if (!existingSeq) {
    const [seq] = await db
      .insert(emailSequence)
      .values({
        creatorId,
        name: "Welcome Series",
        trigger: "enrollment",
        status: "active",
      })
      .returning();

    await db.insert(emailSequenceStep).values([
      {
        sequenceId: seq.id,
        subject: "Welcome to the course!",
        bodyHtml: "<p>Thank you for enrolling. Here is how to get started...</p>",
        delayMinutes: 0,
        sortOrder: 0,
      },
      {
        sequenceId: seq.id,
        subject: "How is your progress?",
        bodyHtml: "<p>Just checking in to see how you are doing with the course.</p>",
        delayMinutes: 4320, // 3 days
        sortOrder: 1,
      },
    ]);
    // eslint-disable-next-line no-console
    console.log("  Created email sequence: Welcome Series");
  }

  // Seed initial AI credits
  const creditTypes = ["course", "rewrite", "image", "quiz"] as const;
  for (const creditType of creditTypes) {
    const [existing] = await db
      .select({ id: creditLedger.id })
      .from(creditLedger)
      .where(eq(creditLedger.creatorId, creatorId))
      .limit(1);

    if (!existing) {
      await db.insert(creditLedger).values({
        creatorId,
        creditType,
        amount: creditType === "course" ? 10 : creditType === "quiz" ? 50 : 25,
        description: "Initial seed credits",
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log("  Seeded AI credits");

  // eslint-disable-next-line no-console
  console.log("\nSeed completed successfully!");
  process.exit(0);
}

seedCreator().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});
