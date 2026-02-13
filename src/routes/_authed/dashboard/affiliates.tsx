import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  Copy,
  Download,
  Link2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authed/dashboard/affiliates")({
  component: AffiliateDashboard,
});

function AffiliateDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [csvFilter, setCsvFilter] = useState<"pending" | "approved" | "paid" | "all">("all");

  const { data: affiliates, isLoading } = useQuery(
    trpc.affiliates.list.queryOptions(),
  );

  const { data: referrals } = useQuery(
    trpc.affiliates.getReferrals.queryOptions(
      { affiliateId: selectedAffiliate ?? "" },
      { enabled: Boolean(selectedAffiliate) },
    ),
  );

  const { data: csvData } = useQuery(
    trpc.affiliates.payoutExport.queryOptions(
      csvFilter === "all" ? {} : { status: csvFilter },
    ),
  );

  const inviteMutation = useMutation(
    trpc.affiliates.invite.mutationOptions({
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: trpc.affiliates.list.queryKey() });
        setInviteOpen(false);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.affiliates.update.mutationOptions({
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: trpc.affiliates.list.queryKey() });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.affiliates.delete.mutationOptions({
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: trpc.affiliates.list.queryKey() });
      },
    }),
  );

  const approveReferralsMutation = useMutation(
    trpc.affiliates.approveReferrals.mutationOptions({
      onSuccess() {
        if (selectedAffiliate) {
          void queryClient.invalidateQueries({
            queryKey: trpc.affiliates.getReferrals.queryKey({ affiliateId: selectedAffiliate }),
          });
        }
        void queryClient.invalidateQueries({ queryKey: trpc.affiliates.list.queryKey() });
      },
    }),
  );

  const markPaidMutation = useMutation(
    trpc.affiliates.markPaid.mutationOptions({
      onSuccess() {
        if (selectedAffiliate) {
          void queryClient.invalidateQueries({
            queryKey: trpc.affiliates.getReferrals.queryKey({ affiliateId: selectedAffiliate }),
          });
        }
        void queryClient.invalidateQueries({ queryKey: trpc.affiliates.list.queryKey() });
      },
    }),
  );

  // Summary stats
  const totalAffiliates = affiliates?.length ?? 0;
  const totalReferrals = affiliates?.reduce((sum, a) => sum + a.referralStats.totalReferrals, 0) ?? 0;
  const totalCommission = affiliates?.reduce((sum, a) => sum + a.referralStats.totalRevenueCents, 0) ?? 0;
  const pendingPayouts = affiliates?.reduce((sum, a) => sum + a.referralStats.pendingCount, 0) ?? 0;

  function downloadCsv() {
    if (!csvData || csvData.length === 0) return;

    const headers = ["Referral ID", "Affiliate Name", "Affiliate Email", "Code", "Commission ($)", "Status", "Date", "Paid At"];
    const rows = csvData.map((r) => [
      r.referralId,
      r.affiliateName,
      r.affiliateEmail,
      r.affiliateCode,
      r.commissionDollars,
      r.status,
      r.date,
      r.paidAt,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliate-payouts-${new Date().toISOString().split("T").at(0)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyReferralLink(code: string) {
    const link = `${globalThis.location.origin}?ref=${code}`;
    void navigator.clipboard.writeText(link);
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-48 rounded-xl" />
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted/50 p-6">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="mt-3 h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Affiliates</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your affiliate partners and track referral commissions.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="rounded-full">
                <Download className="mr-2 size-4" />
                Export CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl">
              <DropdownMenuItem onSelect={() => { setCsvFilter("all"); setTimeout(downloadCsv, 500); }}>
                All Referrals
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setCsvFilter("pending"); setTimeout(downloadCsv, 500); }}>
                Pending Only
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setCsvFilter("approved"); setTimeout(downloadCsv, 500); }}>
                Approved Only
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setCsvFilter("paid"); setTimeout(downloadCsv, 500); }}>
                Paid Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" className="rounded-full">
                <Plus className="mr-2 size-4" />
                Invite Affiliate
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <InviteAffiliateForm
                onSubmit={(data) => inviteMutation.mutate(data)}
                isPending={inviteMutation.isPending}
                error={inviteMutation.error?.message}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="gaspar-card-cream rounded-2xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Total Affiliates</p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{totalAffiliates}</p>
        </div>
        <div className="gaspar-card-blue rounded-2xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Total Referrals</p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{totalReferrals}</p>
        </div>
        <div className="gaspar-card-pink rounded-2xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Total Commission</p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{`$${(totalCommission / 100).toFixed(2)}`}</p>
        </div>
        <div className="gaspar-card-navy rounded-2xl p-6 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Pending Payouts</p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{pendingPayouts}</p>
        </div>
      </div>

      {/* Affiliates Table */}
      <Card className="rounded-2xl border-border/30 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading">Your Affiliates</CardTitle>
          <CardDescription>
            Invite partners to promote your courses and earn commissions on each sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {affiliates && affiliates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Cookie</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((aff) => (
                  <TableRow
                    key={aff.id}
                    className="cursor-pointer border-border/20 transition-colors hover:bg-muted/30"
                    onClick={() => setSelectedAffiliate(aff.id === selectedAffiliate ? null : aff.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{aff.userName}</p>
                        <p className="text-xs text-muted-foreground">{aff.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <code className="rounded-lg bg-muted px-2 py-0.5 text-xs">{aff.referralCode}</code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="size-6 rounded-full p-0"
                          onClick={(e) => { e.stopPropagation(); copyReferralLink(aff.referralCode); }}
                          aria-label="Copy referral link"
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{`${String(aff.commissionPercent ?? 20)}%`}</TableCell>
                    <TableCell className="tabular-nums">{`${String(aff.cookieDays ?? 30)}d`}</TableCell>
                    <TableCell className="tabular-nums">{aff.referralStats.totalReferrals}</TableCell>
                    <TableCell className="tabular-nums">{`$${(aff.referralStats.totalRevenueCents / 100).toFixed(2)}`}</TableCell>
                    <TableCell>
                      <Badge className="rounded-full px-3" variant={aff.status === "active" ? "default" : "secondary"}>
                        {aff.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-8 rounded-full p-0"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Affiliate actions"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onSelect={() => copyReferralLink(aff.referralCode)}
                          >
                            <Link2 className="mr-2 size-4" />
                            Copy Link
                          </DropdownMenuItem>
                          {aff.status === "active" ? (
                            <DropdownMenuItem
                              onSelect={() => updateMutation.mutate({ id: aff.id, status: "paused" })}
                            >
                              <Pause className="mr-2 size-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={() => updateMutation.mutate({ id: aff.id, status: "active" })}
                            >
                              <Play className="mr-2 size-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => deleteMutation.mutate({ id: aff.id })}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
                <Users className="size-8 text-muted-foreground/40" />
              </div>
              <p className="font-heading text-lg font-semibold">No affiliates yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Invite partners to earn commissions on course sales.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                Invite First Affiliate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Detail Panel */}
      {selectedAffiliate && referrals && (
        <Card className="rounded-2xl border-border/30 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading">Referral Details</CardTitle>
              <div className="flex gap-2">
                {referrals.some((r) => r.status === "pending") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      const pendingIds = referrals
                        .filter((r) => r.status === "pending")
                        .map((r) => r.id);
                      approveReferralsMutation.mutate({ referralIds: pendingIds });
                    }}
                    disabled={approveReferralsMutation.isPending}
                  >
                    Approve All Pending
                  </Button>
                )}
                {referrals.some((r) => r.status === "approved") && (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      const approvedIds = referrals
                        .filter((r) => r.status === "approved")
                        .map((r) => r.id);
                      markPaidMutation.mutate({ referralIds: approvedIds });
                    }}
                    disabled={markPaidMutation.isPending}
                  >
                    Mark All Paid
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>Referred User</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id} className="border-border/20">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{ref.referredUserName}</p>
                          <p className="text-xs text-muted-foreground">{ref.referredUserEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{`$${(ref.commissionCents / 100).toFixed(2)}`}</TableCell>
                      <TableCell>
                        <Badge
                          className="rounded-full px-3"
                          variant={
                            ref.status === "paid"
                              ? "default"
                              : ref.status === "approved"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {ref.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ref.paidAt ? new Date(ref.paidAt).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No referrals yet for this affiliate.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- Invite Affiliate Form --

interface InviteFormProps {
  onSubmit: (data: {
    email: string;
    commissionPercent: number;
    cookieDays: number;
    customCode?: string;
  }) => void;
  isPending: boolean;
  error?: string;
}

function InviteAffiliateForm({ onSubmit, isPending, error }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [commission, setCommission] = useState("20");
  const [cookieDays, setCookieDays] = useState("30");
  const [customCode, setCustomCode] = useState("");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading">Invite Affiliate</DialogTitle>
        <DialogDescription>
          Add a partner to your affiliate program. They must have an account on the platform.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            email,
            commissionPercent: Number.parseInt(commission, 10),
            cookieDays: Number.parseInt(cookieDays, 10),
            customCode: customCode.trim() || undefined,
          });
        }}
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="aff-email">Email Address</Label>
            <Input
              id="aff-email"
              type="email"
              placeholder="partner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="aff-commission">Commission %</Label>
              <Select value={commission} onValueChange={setCommission}>
                <SelectTrigger id="aff-commission" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="aff-cookie">Cookie Window</Label>
              <Select value={cookieDays} onValueChange={setCookieDays}>
                <SelectTrigger id="aff-cookie" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aff-code">Custom Referral Code (optional)</Label>
            <Input
              id="aff-code"
              placeholder="e.g. partner2026"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate. Min 3 characters.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" className="rounded-full" disabled={isPending || !email}>
            {isPending ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
