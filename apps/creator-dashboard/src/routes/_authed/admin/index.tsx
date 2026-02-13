import { createFileRoute, Link } from "@tanstack/react-router";
import { Film, Users, Video, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.admin.getStats.queryOptions()
  );
  const { data: recentVideos, isLoading: videosLoading } = useQuery(
    trpc.videos.list.queryOptions({})
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Overview of your platform.
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Videos"
          value={stats?.totalVideos}
          icon={Video}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Series"
          value={stats?.totalSeries}
          icon={Film}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions}
          icon={CreditCard}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Videos */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Videos</h2>
          <Link
            to="/admin/videos"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {videosLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : recentVideos && recentVideos.length > 0 ? (
            recentVideos.slice(0, 5).map((video) => (
              <Card key={video.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {video.published ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No videos yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
