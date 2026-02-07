import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSession, useAuthHelpers } from "@/features/auth/auth-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/account")({
  component: AccountPage,
});

function AccountPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account information and subscription.
      </p>

      <div className="mt-8 space-y-8">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <p className="text-sm">{user?.name ?? "Not set"}</p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <p className="text-sm">{user?.email ?? "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <ChangePasswordCard />

        {/* Billing */}
        <BillingCard />
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password. Please check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BillingCard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const hasSubscription = !!(session as Record<string, unknown>)?.activeSubscription;

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      await authClient.subscription.cancel({
        returnUrl: "/account",
      });
      toast.success("Subscription cancelled successfully.");
    } catch {
      toast.error("Failed to cancel subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription and billing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {hasSubscription ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
        {hasSubscription ? (
          <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
            {isLoading ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        ) : (
          <Button asChild>
            <Link to="/pricing">Subscribe</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
