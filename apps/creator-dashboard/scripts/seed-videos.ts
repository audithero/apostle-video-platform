import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = neon(DATABASE_URL);

const CREATOR_ID = "e9bc6f3b-056c-45c0-b8f2-4db0a42b4513";

// ─── Japanese Cooking Course Videos (Just One Cookbook) ────────────────────
const JAPANESE_VIDEOS: Record<string, { youtubeId: string; duration: number }> = {
  "How to Make Dashi (Japanese Stock)":        { youtubeId: "-JcfVGAgfCI", duration: 276 },
  "Mastering Stovetop Japanese Rice":          { youtubeId: "xjkottdHL_k", duration: 312 },
  "Crafting Perfect Sushi Rice":               { youtubeId: "g8ZVm-owxxQ", duration: 390 },
  "Classic Miso Soup":                         { youtubeId: "wshf6yZbhwk", duration: 264 },
  "Chicken Teriyaki":                          { youtubeId: "6NkG4Qp0lyc", duration: 348 },
  "Gyudon (Japanese Beef Bowl)":               { youtubeId: "YgoCC-GTQcA", duration: 420 },
  "Omurice (Japanese Omelette Rice)":          { youtubeId: "mibRQZm8wXw", duration: 480 },
  "Yakisoba (Japanese Stir-Fried Noodles)":    { youtubeId: "FkdS5DZTSYk", duration: 366 },
  "Tamagoyaki (Japanese Rolled Omelette)":     { youtubeId: "qLlLvhbivPs", duration: 330 },
  "Onigiri (Japanese Rice Balls)":             { youtubeId: "hjfPFK4bCog", duration: 294 },
  "Gyoza (Japanese Dumplings)":                { youtubeId: "5-yt7tFpHPY", duration: 540 },
  "Tonkatsu (Japanese Pork Cutlet)":           { youtubeId: "OlEEEiHlGn4", duration: 450 },
};

// ─── Dog Walking Course Structure ─────────────────────────────────────────
const DOG_WALKING_MODULES = [
  {
    title: "Getting Started with Your Dog",
    description: "Foundation skills every dog owner needs before hitting the pavement.",
    lessons: [
      { title: "3 Easy Things to Teach Your New Puppy",       youtubeId: "g6eB8IeX_cs", duration: 612, isFreePreview: true },
      { title: "How to Potty Train Your Puppy Easily",        youtubeId: "7vOXWCewEYM", duration: 780, isFreePreview: true },
      { title: "How to Train Your Puppy to Stop Biting",      youtubeId: "JRl1FhIBeKc", duration: 660, isFreePreview: false },
    ],
  },
  {
    title: "Leash Skills & Walking Basics",
    description: "Master the art of calm, controlled walks with your dog.",
    lessons: [
      { title: "How to Train Your Dog to Be Good in the House", youtubeId: "PRNJyfU8KiI", duration: 540, isFreePreview: false },
      { title: "Housetraining Troubleshooting Tips",            youtubeId: "m_bgWesYl5I", duration: 480, isFreePreview: false },
      { title: "6 Impressive Dog Tricks That Are Easier Than You Think", youtubeId: "qP2UFCnHpd0", duration: 720, isFreePreview: false },
    ],
  },
];

// ─── Photography Course Structure ─────────────────────────────────────────
const PHOTOGRAPHY_MODULES = [
  {
    title: "Camera Fundamentals",
    description: "Understand your camera settings and the exposure triangle.",
    lessons: [
      { title: "Understanding Aperture",                      youtubeId: "YoFSN5IhpdA", duration: 540, isFreePreview: true },
      { title: "Mastering Shutter Speed",                     youtubeId: "VnM7JLxAB3g", duration: 480, isFreePreview: true },
      { title: "ISO Explained Simply",                        youtubeId: "q2GQXEG0FYo", duration: 420, isFreePreview: false },
    ],
  },
  {
    title: "Composition & Light",
    description: "Learn to see and frame compelling photographs.",
    lessons: [
      { title: "The Rule of Thirds and Beyond",               youtubeId: "VArISvUuyr0", duration: 600, isFreePreview: false },
      { title: "Working with Natural Light",                   youtubeId: "fTr0MRo0MWE", duration: 540, isFreePreview: false },
      { title: "Golden Hour Photography Tips",                 youtubeId: "X1cBGLfyzH0", duration: 480, isFreePreview: false },
    ],
  },
  {
    title: "Real-World Shooting",
    description: "Put theory into practice with hands-on shooting scenarios.",
    lessons: [
      { title: "Street Photography for Beginners",            youtubeId: "bR2I3pAKmpA", duration: 660, isFreePreview: false },
      { title: "Portrait Photography Basics",                 youtubeId: "kmi9TPQ57DM", duration: 720, isFreePreview: false },
    ],
  },
];

async function main() {
  // ── 1. Update Japanese cooking course lessons ──────────────────────────
  console.log("=== Updating Japanese Cooking Course ===");
  const japLessons = await sql`
    SELECT l.id, l.title FROM lesson l
    JOIN course_module m ON l.module_id = m.id
    JOIN course c ON m.course_id = c.id
    WHERE c.slug = 'mastering-japanese-home-cooking'
  `;

  for (const les of japLessons) {
    const video = JAPANESE_VIDEOS[les.title as string];
    if (video) {
      await sql`
        UPDATE lesson
        SET video_url = ${"https://www.youtube.com/watch?v=" + video.youtubeId},
            video_duration_seconds = ${video.duration}
        WHERE id = ${les.id as string}
      `;
      console.log(`  Updated: ${les.title}`);
    } else {
      console.log(`  No video found for: ${les.title}`);
    }
  }

  // ── 2. Rebuild Dog Walking course ──────────────────────────────────────
  console.log("\n=== Rebuilding Dog Walking Course ===");
  const [dogCourse] = await sql`SELECT id FROM course WHERE slug = 'complete-dog-walking-training-guide'`;
  const dogCourseId = dogCourse.id as string;

  // Delete existing modules/lessons (idempotent)
  await sql`DELETE FROM lesson WHERE course_id = ${dogCourseId}`;
  await sql`DELETE FROM course_module WHERE course_id = ${dogCourseId}`;
  console.log("  Cleared old modules");

  let dogTotalLessons = 0;
  for (const [modIdx, mod] of DOG_WALKING_MODULES.entries()) {
    const now = new Date().toISOString();
    const [newMod] = await sql`
      INSERT INTO course_module (id, course_id, title, description, sort_order, created_at)
      VALUES (${crypto.randomUUID()}, ${dogCourseId}, ${mod.title}, ${mod.description}, ${modIdx}, ${now})
      RETURNING id
    `;
    for (const [lesIdx, les] of mod.lessons.entries()) {
      await sql`
        INSERT INTO lesson (id, module_id, course_id, title, lesson_type, video_url, video_duration_seconds, sort_order, is_free_preview, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${newMod.id as string}, ${dogCourseId}, ${les.title}, 'video',
                ${"https://www.youtube.com/watch?v=" + les.youtubeId}, ${les.duration}, ${lesIdx}, ${les.isFreePreview}, ${now}, ${now})
      `;
      dogTotalLessons++;
    }
    console.log(`  Created module: ${mod.title} (${mod.lessons.length} lessons)`);
  }
  console.log(`  Total: ${dogTotalLessons} lessons`);

  // ── 3. Rebuild Photography course ──────────────────────────────────────
  console.log("\n=== Rebuilding Photography Course ===");
  const [photoCourse] = await sql`SELECT id FROM course WHERE slug = 'test-course-intro-to-photography'`;
  const photoCourseId = photoCourse.id as string;

  // Delete existing modules/lessons (idempotent)
  await sql`DELETE FROM lesson WHERE course_id = ${photoCourseId}`;
  await sql`DELETE FROM course_module WHERE course_id = ${photoCourseId}`;
  console.log("  Cleared old modules");

  // Update course metadata
  await sql`
    UPDATE course SET
      title = 'Photography Fundamentals: From Auto to Manual',
      description = 'Master the fundamentals of photography — aperture, shutter speed, ISO, composition, and lighting. Go from shooting in auto mode to creating intentional, beautiful images with full manual control.',
      slug = 'photography-fundamentals'
    WHERE id = ${photoCourseId}
  `;

  let photoTotalLessons = 0;
  for (const [modIdx, mod] of PHOTOGRAPHY_MODULES.entries()) {
    const now2 = new Date().toISOString();
    const [newMod] = await sql`
      INSERT INTO course_module (id, course_id, title, description, sort_order, created_at)
      VALUES (${crypto.randomUUID()}, ${photoCourseId}, ${mod.title}, ${mod.description}, ${modIdx}, ${now2})
      RETURNING id
    `;
    for (const [lesIdx, les] of mod.lessons.entries()) {
      await sql`
        INSERT INTO lesson (id, module_id, course_id, title, lesson_type, video_url, video_duration_seconds, sort_order, is_free_preview, created_at, updated_at)
        VALUES (${crypto.randomUUID()}, ${newMod.id as string}, ${photoCourseId}, ${les.title}, 'video',
                ${"https://www.youtube.com/watch?v=" + les.youtubeId}, ${les.duration}, ${lesIdx}, ${les.isFreePreview}, ${now2}, ${now2})
      `;
      photoTotalLessons++;
    }
    console.log(`  Created module: ${mod.title} (${mod.lessons.length} lessons)`);
  }
  console.log(`  Total: ${photoTotalLessons} lessons`);

  // ── 4. Verify ──────────────────────────────────────────────────────────
  console.log("\n=== Final State ===");
  const courses = await sql`
    SELECT c.title, c.slug, c.status,
      (SELECT count(*) FROM lesson l JOIN course_module m ON l.module_id = m.id WHERE m.course_id = c.id) as lesson_count,
      (SELECT count(*) FROM lesson l JOIN course_module m ON l.module_id = m.id WHERE m.course_id = c.id AND l.video_url IS NOT NULL) as video_count
    FROM course c WHERE c.creator_id = ${CREATOR_ID}
    ORDER BY c.created_at
  `;
  for (const c of courses) {
    console.log(`  ${c.title} [${c.slug}] - ${c.status} - ${c.lesson_count} lessons, ${c.video_count} with video`);
  }
}

main().catch(console.error);
