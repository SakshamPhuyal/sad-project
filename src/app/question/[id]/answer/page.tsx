"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "@/src/components/Navbar";
import { useQnA } from "@/src/context/QnAContext";

export default function PostAnswerPage() {
  const params = useParams<{ id: string }>();
  const questionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { questions, addAnswer, currentUser } = useQnA();
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const question = useMemo(
    () => questions.find((q) => q.id === questionId),
    [questions, questionId],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!question) return;
    if (!currentUser) {
      setFormError("Please login to post an answer.");
      return;
    }

    if (!answer.trim()) {
      setFormError("Please write your answer before posting.");
      return;
    }

    setSubmitting(true);
    const result = await addAnswer(question.id, answer.trim());
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.message || "Failed to post answer.");
      return;
    }

    router.push(`/question/${question.id}`);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-[#f7f4ee]">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            Missing question
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            This question is not available.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            It may have been removed or never existed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Back to questions
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href={`/question/${question.id}`}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to question
        </Link>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-linear-to-br from-white via-[#fdf8ee] to-[#eef1f6] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
            Posting an answer for
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            {question.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Asked by {question.author}
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Share your answer
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Explain your approach so others can learn from it.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!currentUser && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You need to be logged in to answer. Please{" "}
                <Link href="/login" className="font-semibold underline">
                  login
                </Link>
                .
              </p>
            )}
            <textarea
              placeholder="Write your answer here"
              className="min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
            <button
              type="submit"
              disabled={!currentUser || submitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {submitting ? "Posting..." : "Post answer"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
