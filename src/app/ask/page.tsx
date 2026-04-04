"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { useQnA } from "@/src/context/QnAContext";

export default function AskPage() {
  const router = useRouter();
  const { addQuestion, currentUser } = useQnA();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Please login to post a question.");
      return;
    }

    if (!title.trim() || !desc.trim()) {
      setError("Please fill in title and description.");
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSubmitting(true);
    const result = await addQuestion({
      title: title.trim(),
      description: desc.trim(),
      tags: parsedTags,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message || "Failed to post question.");
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              Ask a question
            </h1>
            <p className="text-sm text-slate-600">
              Provide clear details so the community can help faster.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {!currentUser && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You need to be logged in to post. Please{" "}
                <Link href="/login" className="font-semibold underline">
                  login
                </Link>
                .
              </p>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Question title
              </label>
              <input
                placeholder="e.g. How do I handle state in Next.js?"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                placeholder="Add context, what you've tried, and the expected result."
                className="mt-2 min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Tags
              </label>
              <input
                placeholder="react, nextjs, state"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Separate tags with commas so people can find your question.
              </p>
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!currentUser || submitting}
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                {submitting ? "Posting..." : "Post question"}
              </button>
              <span className="text-xs text-slate-500">
                Be respectful and include enough details for others to help.
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
