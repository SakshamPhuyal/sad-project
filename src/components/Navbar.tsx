"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { useQnA } from "@/src/context/QnAContext";

export default function Navbar() {
  const router = useRouter();
  const { currentUser, refreshMe } = useQnA();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        toast.error(data?.message || "Failed to logout");
        return;
      }

      await refreshMe();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong while logging out");
    }
  };

  return (
    <div className="border-b bg-white">
      <div className="max-w-5xl mx-auto flex justify-between p-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Q&A Platform System
        </Link>

        <div className="flex items-center gap-2">
          {!currentUser ? (
            <Link
              href="/login"
              className="border border-blue-500 text-blue-600 px-4 py-2 rounded"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex items-center rounded-full border border-slate-300 p-2 text-slate-700 hover:bg-slate-100"
                aria-label="Open profile menu"
              >
                <CircleUserRound className="h-5 w-5" />
              </button>

              {isOpen && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser.displayName || currentUser.username}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currentUser.email}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-col gap-1">
                    <Link
                      href="/myquestions"
                      className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setIsOpen(false)}
                    >
                      My Questions
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        void handleLogout();
                      }}
                      className="rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <Link
            href="/ask"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ask Question
          </Link>
        </div>
      </div>
    </div>
  );
}
