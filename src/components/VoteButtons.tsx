"use client";

import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

export default function VoteButtons({
  votes,
  onVote,
}: {
  votes: number;
  onVote: (delta: number) => void;
}) {
  const [selection, setSelection] = useState<"up" | "down" | null>(null);

  const handleUpvote = () => {
    if (selection === "up") {
      setSelection(null);
      onVote(-1);
      return;
    }

    if (selection === "down") {
      setSelection("up");
      onVote(2);
      return;
    }

    setSelection("up");
    onVote(1);
  };

  const handleDownvote = () => {
    if (selection === "down") {
      setSelection(null);
      onVote(1);
      return;
    }

    if (selection === "up") {
      setSelection("down");
      onVote(-2);
      return;
    }

    setSelection("down");
    onVote(-1);
  };

  return (
    <div className="flex flex-col items-center gap-1 mr-4">
      <button
        onClick={handleUpvote}
        className={`rounded-full p-1 transition ${
          selection === "up"
            ? "text-emerald-600"
            : "text-slate-900 hover:text-emerald-600"
        }`}
        aria-label="Upvote"
        aria-pressed={selection === "up"}
      >
        <ArrowBigUp className="h-7 w-7" />
      </button>

      <span className="font-semibold text-slate-900">{votes}</span>

      <button
        onClick={handleDownvote}
        className={`rounded-full p-1 transition ${
          selection === "down"
            ? "text-rose-600"
            : "text-slate-900 hover:text-rose-600"
        }`}
        aria-label="Downvote"
        aria-pressed={selection === "down"}
      >
        <ArrowBigDown className="h-7 w-7" />
      </button>
    </div>
  );
}
