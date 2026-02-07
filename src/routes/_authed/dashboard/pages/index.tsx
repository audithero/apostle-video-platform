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
import { Badge } from "@/components/ui/badge";
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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage landing pages for your courses.
          </p>
        </div>
        <Button type="button">
          <Plus className="mr-2 size-4" />
          New Page
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{MOCK_PAGES.length}</p>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {MOCK_PAGES.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {(() => {
                const totalViews = MOCK_PAGES.reduce((s, p) => s + p.views, 0);
                const totalConversions = MOCK_PAGES.reduce((s, p) => s + p.conversions, 0);
                return totalViews > 0
                  ? `${String(Math.round((totalConversions / totalViews) * 100))}%`
                  : "0%";
              })()}
            </p>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <div className="mt-8 space-y-3">
        {MOCK_PAGES.map((page) => (
          <Card key={page.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{page.title}</p>
                  <Badge
                    variant={page.status === "published" ? "default" : "secondary"}
                  >
                    {page.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{`/${page.slug}`}</span>
                  {page.views > 0 && (
                    <>
                      <span>{`${page.views.toLocaleString()} views`}</span>
                      <span>{`${String(page.conversions)} conversions`}</span>
                    </>
                  )}
                  <span>{`Updated ${formatDistanceToNow(page.updatedAt, { addSuffix: true })}`}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={`/p/${page.slug}`} target="_blank" rel="noopener">
                    <ExternalLink className="mr-1 size-3" />
                    Preview
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
      </div>
    </div>
  );
}
