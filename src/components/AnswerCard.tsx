"use client";

import VoteButtons from "./VoteButtons";

export default function AnswerCard({ answer, onVote }: any) {
  return (
    <div className="flex border rounded-lg p-4 bg-gray-50">
      <VoteButtons votes={answer.votes} onVote={onVote} />

      <div className="flex-1">
        <p>{answer.text}</p>

        <div className="mt-3 ml-3">
          {answer.comments.map((c: any) => (
            <p key={c.id} className="text-sm text-gray-600">
              • {c.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
