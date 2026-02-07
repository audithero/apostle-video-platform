import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Mail,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Send,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authed/dashboard/emails/")({
  component: EmailManagement,
});

// ── Mock Data ────────────────────────────────────────────────────────────

interface Broadcast {
  id: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  recipientCount: number;
  openRate: number;
  clickRate: number;
  scheduledAt: Date | null;
  sentAt: Date | null;
}

interface Sequence {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "paused" | "draft";
  stepCount: number;
  enrolledCount: number;
  completedCount: number;
}

const MOCK_BROADCASTS: ReadonlyArray<Broadcast> = [
  {
    id: "b1",
    subject: "New Course: Color Grading Fundamentals!",
    status: "sent",
    recipientCount: 312,
    openRate: 42.3,
    clickRate: 8.7,
    scheduledAt: null,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "b2",
    subject: "Holiday Special: 30% Off All Courses",
    status: "scheduled",
    recipientCount: 312,
    openRate: 0,
    clickRate: 0,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    sentAt: null,
  },
  {
    id: "b3",
    subject: "Weekly Tips: Lighting Masterclass Update",
    status: "draft",
    recipientCount: 0,
    openRate: 0,
    clickRate: 0,
    scheduledAt: null,
    sentAt: null,
  },
];

const MOCK_SEQUENCES: ReadonlyArray<Sequence> = [
  {
    id: "s1",
    name: "Welcome Series",
    trigger: "enrollment",
    status: "active",
    stepCount: 5,
    enrolledCount: 127,
    completedCount: 89,
  },
  {
    id: "s2",
    name: "Course Completion Follow-Up",
    trigger: "course_completed",
    status: "active",
    stepCount: 3,
    enrolledCount: 43,
    completedCount: 38,
  },
  {
    id: "s3",
    name: "Re-engagement Campaign",
    trigger: "manual",
    status: "paused",
    stepCount: 4,
    enrolledCount: 0,
    completedCount: 0,
  },
];

const EMAIL_STATS = {
  sent: 4200,
  opened: 1890,
  clicked: 420,
  limit: 5000,
} as const;

// ── Component ────────────────────────────────────────────────────────────

function EmailManagement() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Marketing</h1>
          <p className="mt-1 text-muted-foreground">
            Manage broadcasts and automated email sequences.
          </p>
        </div>
        <Button type="button">
          <Plus className="mr-2 size-4" />
          New Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{EMAIL_STATS.sent.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {`Emails Sent (of ${EMAIL_STATS.limit.toLocaleString()})`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {`${String(Math.round((EMAIL_STATS.opened / EMAIL_STATS.sent) * 100))}%`}
            </p>
            <p className="text-sm text-muted-foreground">Open Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {`${String(Math.round((EMAIL_STATS.clicked / EMAIL_STATS.sent) * 100))}%`}
            </p>
            <p className="text-sm text-muted-foreground">Click Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{MOCK_SEQUENCES.filter((s) => s.status === "active").length}</p>
            <p className="text-sm text-muted-foreground">Active Sequences</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="broadcasts" className="mt-8">
        <TabsList>
          <TabsTrigger value="broadcasts">
            <Send className="mr-2 size-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <Zap className="mr-2 size-4" />
            Sequences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts" className="mt-4 space-y-3">
          {MOCK_BROADCASTS.map((broadcast) => (
            <BroadcastCard key={broadcast.id} broadcast={broadcast} />
          ))}
        </TabsContent>

        <TabsContent value="sequences" className="mt-4 space-y-3">
          {MOCK_SEQUENCES.map((sequence) => (
            <SequenceCard key={sequence.id} sequence={sequence} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function BroadcastCard({ broadcast }: { broadcast: Broadcast }) {
  const statusColors = {
    draft: "secondary",
    scheduled: "outline",
    sending: "default",
    sent: "default",
  } as const;

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Mail className="size-5" />
          </div>
          <div>
            <p className="font-medium">{broadcast.subject}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant={statusColors[broadcast.status]}>{broadcast.status}</Badge>
              {broadcast.sentAt ? (
                <span>{`Sent ${formatDistanceToNow(broadcast.sentAt, { addSuffix: true })}`}</span>
              ) : broadcast.scheduledAt ? (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {`Scheduled ${formatDistanceToNow(broadcast.scheduledAt, { addSuffix: true })}`}
                </span>
              ) : null}
              {broadcast.status === "sent" && (
                <>
                  <span>{`${String(broadcast.recipientCount)} recipients`}</span>
                  <span>{`${String(broadcast.openRate)}% opened`}</span>
                  <span>{`${String(broadcast.clickRate)}% clicked`}</span>
                </>
              )}
            </div>
          </div>
        </div>
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
            {broadcast.status === "draft" && (
              <DropdownMenuItem>
                <Send className="mr-2 size-4" />
                Send Now
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

function SequenceCard({ sequence }: { sequence: Sequence }) {
  const statusColors = {
    active: "default",
    paused: "secondary",
    draft: "outline",
  } as const;

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="font-medium">{sequence.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant={statusColors[sequence.status]}>{sequence.status}</Badge>
              <span>{`Trigger: ${sequence.trigger}`}</span>
              <span>{`${String(sequence.stepCount)} steps`}</span>
              <span>{`${String(sequence.enrolledCount)} enrolled`}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sequence.status === "paused" && (
            <Button type="button" variant="outline" size="sm">
              <Play className="mr-1 size-3" />
              Resume
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="mr-2 size-4" />
                Edit Steps
              </DropdownMenuItem>
              <DropdownMenuItem>View Analytics</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
