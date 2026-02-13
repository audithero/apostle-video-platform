import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SocialLink {
  platform: string;
  url: string;
}

interface InstructorBioProps {
  name?: string;
  avatar?: string;
  bio?: string;
  credentials?: string[] | string;
  socialLinks?: SocialLink[];
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

const platformIcons: Record<string, string> = {
  twitter: "𝕏",
  x: "𝕏",
  facebook: "f",
  instagram: "ig",
  linkedin: "in",
  youtube: "yt",
  github: "gh",
  tiktok: "tt",
};

export default function InstructorBio({
  name = "Instructor Name",
  avatar = "",
  bio = "",
  credentials = [],
  socialLinks = [],
  sectionId,
  blockId,
  children,
}: InstructorBioProps) {
  return (
    <section
      id={sectionId ?? blockId}
      className={cn(
        "flex flex-col items-center gap-6 rounded-2xl bg-white/80 p-8 text-center",
        "shadow-sm backdrop-blur-sm dark:bg-white/5",
      )}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="h-28 w-28 rounded-full object-cover ring-4 ring-[var(--sdui-color-primary,#6366f1)]/20"
        />
      ) : (
        <div
          className={cn(
            "flex h-28 w-28 items-center justify-center rounded-full",
            "bg-[var(--sdui-color-primary,#6366f1)]/10 text-3xl font-bold",
            "text-[var(--sdui-color-primary,#6366f1)]",
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
        {credentials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {(Array.isArray(credentials) ? credentials : [credentials]).map(
              (cred) => (
                <span
                  key={cred}
                  className="rounded-full bg-[var(--sdui-color-primary,#6366f1)]/10 px-3 py-1 text-xs font-medium text-[var(--sdui-color-primary,#6366f1)]"
                >
                  {cred}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      {bio && (
        <p className="max-w-lg text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {bio}
        </p>
      )}

      {socialLinks.length > 0 && (
        <nav aria-label="Social links" className="flex gap-3">
          {socialLinks.map((link) => (
            <a
              key={`${link.platform}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-gray-100 text-sm font-semibold text-gray-600 transition-colors",
                "hover:bg-[var(--sdui-color-primary,#6366f1)] hover:text-white",
                "dark:bg-white/10 dark:text-gray-300",
              )}
              aria-label={link.platform}
            >
              {platformIcons[link.platform.toLowerCase()] ?? link.platform.slice(0, 2)}
            </a>
          ))}
        </nav>
      )}

      {children}
    </section>
  );
}
