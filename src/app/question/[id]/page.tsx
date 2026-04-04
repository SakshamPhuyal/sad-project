"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "@/src/components/Navbar";
import VoteButtons from "../../../components/VoteButtons";
import { useQnA } from "@/src/context/QnAContext";

export default function QuestionPage() {
  const params = useParams<{ id: string }>();
  const questionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { questions, addComment, currentUser, voteAnswer, voteQuestion } =
    useQnA();
  const [showAnswers, setShowAnswers] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<
    Record<string, { text: string; error: string }>
  >({});
  const [questionComment, setQuestionComment] = useState({
    text: "",
    error: "",
  });

  const question = useMemo(
    () => questions.find((q) => q.id === questionId),
    [questions, questionId],
  );

  const sortedAnswers = useMemo(() => {
    if (!question) return [];
    return [...question.answers].sort((a, b) => b.votes - a.votes);
  }, [question]);

  const questionComments = question?.comments ?? [];

  const getInitial = (name: string) => {
    const initial = name.trim().charAt(0).toUpperCase();
    return initial || "U";
  };

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateCommentDraft = (
    answerId: string,
    next: Partial<{ text: string; error: string }>,
  ) => {
    setCommentDrafts((prev) => {
      const current = prev[answerId] ?? { text: "", error: "" };
      return { ...prev, [answerId]: { ...current, ...next } };
    });
  };

  const submitComment = async (answerId: string) => {
    if (!question) return;
    if (!currentUser) {
      const message = "Please login to comment.";
      updateCommentDraft(answerId, { error: message });
      toast.info(message);
      return;
    }

    const draft = commentDrafts[answerId] ?? { text: "", error: "" };
    const text = draft.text.trim();

    if (!text) {
      const message = "Please add a comment.";
      updateCommentDraft(answerId, { error: message });
      toast.warn(message);
      return;
    }

    const result = await addComment({ aid: answerId, text });
    if (!result.ok) {
      const message = result.message || "Failed to post comment.";
      updateCommentDraft(answerId, {
        error: message,
      });
      toast.error(message);
      return;
    }

    toast.success("Comment posted");
    updateCommentDraft(answerId, { text: "", error: "" });
  };

  const handleViewAnswers = () => {
    if (!showAnswers) {
      setShowAnswers(true);
    } else {
      scrollToSection("answers");
    }
  };

  const submitQuestionComment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!question) return;

    if (!currentUser) {
      const message = "Please login to comment.";
      setQuestionComment((prev) => ({
        ...prev,
        error: message,
      }));
      toast.info(message);
      return;
    }

    const text = questionComment.text.trim();

    if (!text) {
      const message = "Please add a comment.";
      setQuestionComment((prev) => ({
        ...prev,
        error: message,
      }));
      toast.warn(message);
      return;
    }

    const result = await addComment({ qid: question.id, text });
    if (!result.ok) {
      const message = result.message || "Failed to post comment.";
      setQuestionComment((prev) => ({
        ...prev,
        error: message,
      }));
      toast.error(message);
      return;
    }

    toast.success("Comment posted");
    setQuestionComment({ text: "", error: "" });
  };

  useEffect(() => {
    if (showAnswers) scrollToSection("answers");
  }, [showAnswers]);

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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Back to questions
          </Link>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleViewAnswers}
              disabled={showAnswers}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-400 disabled:cursor-default disabled:border-slate-200 disabled:text-slate-400"
            >
              {showAnswers
                ? `Answers visible (${question.answers.length})`
                : `View answers (${question.answers.length})`}
            </button>
            <Link
              href={`/question/${question.id}/answer`}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Post an answer
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-linear-to-br from-white via-[#fdf8ee] to-[#eef1f6] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start">
              <div className="shrink-0">
                <VoteButtons
                  votes={question.votes}
                  disabled={!currentUser}
                  onVote={(value) => {
                    void (async () => {
                      const result = await voteQuestion(question.id, value);
                      if (!result.ok) {
                        toast.error(result.message || "Failed to submit vote");
                        return;
                      }
                      toast.success("Vote updated");
                    })();
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                  Question
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                  {question.title}
                </h1>
                <p className="mt-4 text-sm text-slate-700 leading-relaxed">
                  {question.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Asked by {question.author}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-center text-sm text-slate-600">
              <div>
                <div className="text-2xl font-semibold text-slate-900">
                  {question.answers.length}
                </div>
                <div className="text-xs uppercase tracking-[0.2em]">
                  Answers
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">
                  {questionComments.length}
                </div>
                <div className="text-xs uppercase tracking-[0.2em]">
                  Comments
                </div>
              </div>
            </div>
          </div>
        </section>

        {!showAnswers && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Question comments ({questionComments.length})
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Visible to everyone
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {questionComments.length === 0 ? (
                <p className="text-slate-400">No comments yet.</p>
              ) : (
                questionComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {getInitial(comment.author)}
                    </div>
                    <div>
                      <p className="text-slate-900">
                        <span className="font-semibold">{comment.author}</span>
                      </p>
                      <p className="text-sm text-slate-600">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={submitQuestionComment}
              className="mt-5 grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto]"
            >
              <input
                placeholder="Add a comment"
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none sm:col-span-2"
                value={questionComment.text}
                onChange={(event) =>
                  setQuestionComment((prev) => ({
                    ...prev,
                    text: event.target.value,
                    error: "",
                  }))
                }
              />
              <button
                type="submit"
                disabled={!currentUser}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Comment
              </button>
            </form>
            {!currentUser && (
              <p className="mt-2 text-xs text-amber-700">
                Login required for posting comments and votes.
              </p>
            )}
            {questionComment.error && (
              <p className="mt-2 text-sm text-rose-600">
                {questionComment.error}
              </p>
            )}
          </section>
        )}

        {showAnswers && (
          <section id="answers" className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                Answers ({question.answers.length})
              </h2>
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Sorted by votes
              </span>
            </div>

            {sortedAnswers.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                No answers yet. Be the first to respond.
              </div>
            )}

            <div className="mt-6 space-y-5">
              {sortedAnswers.map((ans) => {
                const draft = commentDrafts[ans.id] ?? {
                  text: "",
                  error: "",
                };

                return (
                  <article
                    key={ans.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <VoteButtons
                        votes={ans.votes}
                        disabled={!currentUser}
                        onVote={(value) => {
                          void (async () => {
                            const result = await voteAnswer(ans.id, value);
                            if (!result.ok) {
                              toast.error(
                                result.message || "Failed to submit vote",
                              );
                              return;
                            }
                            toast.success("Vote updated");
                          })();
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {ans.text}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                          Answered by {ans.author}
                        </p>

                        <div className="mt-4 space-y-3 text-xs text-slate-600">
                          {ans.comments.length === 0 ? (
                            <p className="text-slate-400">No comments yet.</p>
                          ) : (
                            ans.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start gap-3"
                              >
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                                  {getInitial(comment.author)}
                                </div>
                                <div>
                                  <p className="text-slate-900">
                                    <span className="font-semibold">
                                      {comment.author}
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            void submitComment(ans.id);
                          }}
                          className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <input
                            placeholder="Add a comment"
                            className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-slate-400 focus:outline-none"
                            value={draft.text}
                            onChange={(event) =>
                              updateCommentDraft(ans.id, {
                                text: event.target.value,
                                error: "",
                              })
                            }
                          />
                          <button
                            type="submit"
                            disabled={!currentUser}
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                          >
                            Comment
                          </button>
                        </form>
                        {!currentUser && (
                          <p className="mt-2 text-xs text-amber-700">
                            Login required for posting comments and votes.
                          </p>
                        )}
                        {draft.error && (
                          <p className="mt-2 text-xs text-rose-600">
                            {draft.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
