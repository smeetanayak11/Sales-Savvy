import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail, ShoppingBag, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Sales Savvy" },
      { name: "description", content: "Your Sales Savvy profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="animate-pulse h-64 rounded-2xl bg-muted max-w-md mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Please sign in</h2>
        <p className="text-muted-foreground mb-6">Sign in to view your profile.</p>
        <Link to="/auth" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">{isAdmin ? "Administrator" : "Customer"}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/orders" className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                <span className="text-sm font-semibold">My Orders</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                  <span className="text-sm font-semibold">Admin Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
              <Link to="/products" className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors">
                <span className="text-sm font-semibold">Browse Products</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full h-12 rounded-xl border border-border text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
