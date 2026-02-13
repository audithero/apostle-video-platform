import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authed/dashboard/pages/")({
  component: LandingPagesManager,
});

// ── Mock Data ────────────────────────────────────────────────────────────

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  views: number;
  conversions: number;
  updatedAt: Date;
}

const MOCK_PAGES: ReadonlyArray<LandingPage> = [
  {
    id: "p1",
    title: "Cinematic Lighting Masterclass",
    slug: "lighting-masterclass",
    status: "published",
    views: 1_432,
    conversions: 127,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p2",
    title: "Documentary Storytelling Workshop",
    slug: "doc-storytelling",
    status: "published",
    views: 856,
    conversions: 84,
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p3",
    title: "Color Grading Course Preview",
    slug: "color-grading-preview",
    status: "draft",
    views: 0,
    conversions: 0,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ── Component ────────────────────────────────────────────────────────────

function LandingPagesManager() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Landing Pages</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Create and manage landing pages for your courses.
          </p>
        </div>
        <Button type="button" className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Create Page
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-heading text-2xl font-bold tracking-tight">{MOCK_PAGES.length}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-heading text-2xl font-bold tracking-tight">
              {MOCK_PAGES.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-heading text-2xl font-bold tracking-tight">
              {(() => {
                const totalViews = MOCK_PAGES.reduce((s, p) => s + p.views, 0);
                const totalConversions = MOCK_PAGES.reduce((s, p) => s + p.conversions, 0);
                return totalViews > 0
                  ? `${String(Math.round((totalConversions / totalViews) * 100))}%`
                  : "0%";
              })()}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        {MOCK_PAGES.map((page) => (
          <Card key={page.id} className="rounded-2xl border-border/60 shadow-sm transition-all hover:border-border hover:shadow-md">
            <CardContent className="flex items-center justify-between py-5 px-6">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{page.title}</p>
                  <span
                    className={
                      page.status === "published"
                        ? "pill border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "pill border-border bg-muted text-muted-foreground"
                    }
                  >
                    {page.status}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{`/${page.slug}`}</span>
                  {page.views > 0 && (
                    <>
                      <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                      <span>{`${page.views.toLocaleString()} views`}</span>
                      <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                      <span>{`${String(page.conversions)} conversions`}</span>
                    </>
                  )}
                  <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                  <span>{`Updated ${formatDistanceToNow(page.updatedAt, { addSuffix: true })}`}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="rounded-full" asChild>
                  <a href={`/p/${page.slug}`} target="_blank" rel="noopener">
                    <ExternalLink className="mr-1 size-3" />
                    Preview
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="rounded-full">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state */}
        {MOCK_PAGES.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/60 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-gaspar-lavender/15">
              <Plus className="size-6 text-gaspar-purple" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">No pages yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first landing page to start converting visitors.</p>
            </div>
            <Button type="button" className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 size-4" />
              Create Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
