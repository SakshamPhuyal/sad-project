"use client";

import { useQnA } from "@/src/context/QnAContext";
import Navbar from "@/src/components/Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function HomePage() {
  const { questions } = useQnA();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matches = (q: (typeof questions)[number]) => {
      if (!needle) return true;
      const haystack =
        `${q.title} ${q.description} ${q.tags.join(" ")}`.toLowerCase();
      return haystack.includes(needle);
    };

    const applyFilter = (q: (typeof questions)[number]) => {
      if (filter === "unanswered") return q.answers.length === 0;
      if (filter === "answered") return q.answers.length > 0;
      if (filter === "commented") return (q.comments?.length ?? 0) > 0;
      return true;
    };

    return questions
      .filter(matches)
      .filter(applyFilter)
      .sort((a, b) => b.votes - a.votes);
  }, [questions, search, filter]);

  const hasQuestions = questions.length > 0;
  const hasMatches = filtered.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Top questions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse what the community is discussing right now.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput);
            }}
            className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm focus-within:border-slate-400 md:flex-1"
            aria-label="Search questions"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search by title, description, or tag"
              className="w-full bg-transparent py-2 text-sm text-slate-700 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <div className="w-full md:w-56">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger aria-label="Filter questions">
                <SelectValue placeholder="Filter questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All questions</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="answered">Has answers</SelectItem>
                <SelectItem value="commented">Has comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!hasQuestions && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No questions yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Be the first to start the conversation.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Use the Ask Question button in the top bar to get started.
            </p>
          </div>
        )}

        {hasQuestions && !hasMatches && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No questions match that search yet.
          </div>
        )}

        <div className="mt-6 space-y-4">
          {filtered.map((q) => (
            <Link
              href={`/question/${q.id}`}
              key={q.id}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {q.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {q.description.length > 140
                      ? `${q.description.slice(0, 140)}...`
                      : q.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Asked by {q.author}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-center text-sm text-slate-600 md:ml-6">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {q.votes}
                    </div>
                    <div className="text-xs">votes</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {q.answers.length}
                    </div>
                    <div className="text-xs">answers</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {q.comments?.length ?? 0}
                    </div>
                    <div className="text-xs">comments</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
