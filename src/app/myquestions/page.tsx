"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Navbar from "@/src/components/Navbar";
import type { Question } from "@/src/types/type";

type FetchState = "loading" | "ready" | "unauthorized" | "error";

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<FetchState>("loading");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/questions/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          setState("unauthorized");
          return;
        }

        const data = await response.json();
        if (!response.ok || !data?.success) {
          setState("error");
          return;
        }

        setQuestions(Array.isArray(data.data) ? data.data : []);
        setState("ready");
      } catch {
        setState("error");
      }
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-slate-900">My Questions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Questions you have posted.
        </p>

        {state === "loading" && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading your questions...
          </div>
        )}

        {state === "unauthorized" && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            Please login to view your questions.{" "}
            <Link href="/login" className="font-semibold underline">
              Go to login
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Could not load your questions right now.
          </div>
        )}

        {state === "ready" && questions.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No questions added yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You have not posted any question yet.
            </p>
            <Link
              href="/ask"
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Ask your first question
            </Link>
          </div>
        )}

        {state === "ready" && questions.length > 0 && (
          <div className="mt-6 space-y-4">
            {questions.map((question) => (
              <Link
                href={`/question/${question.id}`}
                key={question.id}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {question.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {question.description.length > 140
                    ? `${question.description.slice(0, 140)}...`
                    : question.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-5 text-xs text-slate-500">
                  <span>{question.votes} votes</span>
                  <span>{question.answers.length} answers</span>
                  <span>{question.comments.length} comments</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
