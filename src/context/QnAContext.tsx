"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Question } from "@/src/types/type";

interface ContextType {
  questions: Question[];
  addQuestion: (q: Question) => void;
  addAnswer: (qid: string, text: string, author: string) => void;
  addComment: (qid: string, aid: string, text: string, author: string) => void;
  addQuestionComment: (qid: string, text: string, author: string) => void;
  voteQuestion: (id: string, val: number) => void;
  voteAnswer: (qid: string, aid: string, val: number) => void; // ✅ Must be here
}

const QnAContext = createContext<ContextType | null>(null);

export const QnAProvider = ({ children }: { children: React.ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const normalizeQuestions = (data: Question[]) =>
    data.map((q) => ({
      ...q,
      comments: q.comments ?? [],
      answers: (q.answers ?? []).map((a) => ({
        ...a,
        comments: a.comments ?? [],
      })),
    }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("questions");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setQuestions(normalizeQuestions(parsed));
    } catch {
      setQuestions([]);
    }
  }, []);

  const save = (data: Question[]) => {
    const normalized = normalizeQuestions(data);
    setQuestions(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem("questions", JSON.stringify(normalized));
    }
  };

  const addQuestion = (q: Question) =>
    save([...questions, { ...q, comments: q.comments ?? [] }]);

  const voteQuestion = (id: string, val: number) =>
    save(
      questions.map((q) => (q.id === id ? { ...q, votes: q.votes + val } : q)),
    );

  const addAnswer = (qid: string, text: string, author: string) =>
    save(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: Date.now().toString(),
                  text,
                  author,
                  votes: 0,
                  comments: [],
                },
              ],
            }
          : q,
      ),
    );

  const addComment = (qid: string, aid: string, text: string, author: string) =>
    save(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === aid
                  ? {
                      ...a,
                      comments: [
                        ...a.comments,
                        { id: Date.now().toString(), text, author },
                      ],
                    }
                  : a,
              ),
            }
          : q,
      ),
    );

  const addQuestionComment = (qid: string, text: string, author: string) =>
    save(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              comments: [
                ...(q.comments ?? []),
                { id: Date.now().toString(), text, author },
              ],
            }
          : q,
      ),
    );

  // ✅ Vote answer and sort by votes descending
  const voteAnswer = (qid: string, aid: string, val: number) =>
    save(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              answers: q.answers
                .map((a) => (a.id === aid ? { ...a, votes: a.votes + val } : a))
                .sort((a, b) => b.votes - a.votes),
            }
          : q,
      ),
    );

  return (
    <QnAContext.Provider
      value={{
        questions,
        addQuestion,
        addAnswer,
        addComment,
        addQuestionComment,
        voteQuestion,
        voteAnswer,
      }}
    >
      {children}
    </QnAContext.Provider>
  );
};

export const useQnA = () => {
  const context = useContext(QnAContext);
  if (!context) throw new Error("useQnA must be used inside QnAProvider");
  return context;
};
