"use client";

import { ArrowBigUp, ArrowBigDown } from "lucide-react";

export default function VoteButtons({
  votes,
  onVote,
  disabled = false,
}: {
  votes: number;
  onVote: (value: "UP" | "DOWN") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 mr-4">
      <button
        type="button"
        onClick={() => onVote("UP")}
        disabled={disabled}
        className="rounded-full p-1 text-slate-900 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:text-slate-300"
        aria-label="Upvote"
      >
        <ArrowBigUp className="h-7 w-7" />
      </button>

      <span className="font-semibold text-slate-900">{votes}</span>

      <button
        type="button"
        onClick={() => onVote("DOWN")}
        disabled={disabled}
        className="rounded-full p-1 text-slate-900 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-300"
        aria-label="Downvote"
      >
        <ArrowBigDown className="h-7 w-7" />
      </button>
    </div>
  );
}
