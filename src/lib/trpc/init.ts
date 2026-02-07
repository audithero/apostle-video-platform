import { getCookie } from "@tanstack/react-start/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema/creator";
import type { Language } from "../intl/i18n";

export const createTRPCContext = async (opts: { headers: Headers; req: Request }) => {
  const locale = (getCookie("i18next") as Language) || "en";
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    session,
    locale,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
  sse: {
    maxDurationMs: 5 * 60 * 1_000,
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  if (ctx.session.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

// Creator procedure - requires creator role and resolves creator profile
export const creatorProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const role = ctx.session.user.role;
  if (role !== "creator" && role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Creator access required",
    });
  }

  // Resolve creator profile from user ID
  const [creatorProfile] = await db
    .select()
    .from(creator)
    .where(eq(creator.userId, ctx.session.user.id))
    .limit(1);

  if (!creatorProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Creator profile not found. Please complete onboarding.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      creator: creatorProfile,
    },
  });
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const createCallerFactory = t.createCallerFactory;
