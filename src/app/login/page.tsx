"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

type LoginFormValues = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError("");

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: values.identifier.trim(),
          password: values.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        const message = data?.message || "Login failed";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Logged in successfully");
      router.push("/");
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back. Log in to continue.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email or Username
              </label>
              <input
                type="text"
                {...register("identifier", {
                  required: "Email or username is required",
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500"
                placeholder="you@example.com"
                autoComplete="username"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-rose-700">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-700">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-slate-600">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-slate-900 underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
