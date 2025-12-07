"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const username = form.get("username");
    const password = form.get("password");

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      toast.success("Signed in successfully!");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      toast.error("Invalid username or password");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-2xl p-8 bg-card">
        <h1 className="text-2xl font-semibold text-center">Sign In</h1>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input name="username" required />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input name="password" type="password" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-center">
          No account?{" "}
          <Link href="/sign-up" className="text-primary font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
