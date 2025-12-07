"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);
    const username = form.get("username");
    const password = form.get("password");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // VERY IMPORTANT
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      toast.success("Account created! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 800);
    } else {
      toast.error("Signup failed. Username may already exist.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-2xl p-8 bg-card">
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>

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
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
