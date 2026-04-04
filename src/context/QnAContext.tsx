"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Question } from "@/src/types/type";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
};

interface ContextType {
  questions: Question[];
  loading: boolean;
  currentUser: AuthUser | null;
  addQuestion: (payload: {
    title: string;
    description: string;
    tags: string[];
  }) => Promise<{ ok: boolean; message?: string }>;
  addAnswer: (
    qid: string,
    text: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  addComment: (payload: {
    qid?: string;
    aid?: string;
    text: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  voteQuestion: (
    id: string,
    value: "UP" | "DOWN",
  ) => Promise<{ ok: boolean; message?: string }>;
  voteAnswer: (
    aid: string,
    value: "UP" | "DOWN",
  ) => Promise<{ ok: boolean; message?: string }>;
  refreshQuestions: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const QnAContext = createContext<ContextType | null>(null);

export const QnAProvider = ({ children }: { children: React.ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const normalizeQuestions = (data: Question[] = []) => {
    try {
      return data.map((q) => ({
        ...q,
        comments: q.comments ?? [],
        answers: (q.answers ?? []).map((a) => ({
          ...a,
          comments: a.comments ?? [],
        })),
      }));
    } catch {
      return [];
    }
  };

  const refreshQuestions = async () => {
    const response = await fetch("/api/questions", {
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json();
    if (response.ok && data?.success) {
      setQuestions(normalizeQuestions(data.data));
    }
  };

  const refreshMe = async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json();
    if (response.ok && data?.success) {
      setCurrentUser(data.user);
      return;
    }
    setCurrentUser(null);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([refreshQuestions(), refreshMe()]);
      setLoading(false);
    };
    void initialize();
  }, []);

  const addQuestion = async (payload: {
    title: string;
    description: string;
    tags: string[];
  }) => {
    const response = await fetch("/api/questions", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { ok: false, message: data?.message || "Failed to post question" };
    }

    await refreshQuestions();
    return { ok: true };
  };

  const addAnswer = async (qid: string, text: string) => {
    const response = await fetch(`/api/questions/${qid}/answers`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: text }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { ok: false, message: data?.message || "Failed to post answer" };
    }

    await refreshQuestions();
    return { ok: true };
  };

  const addComment = async (payload: {
    qid?: string;
    aid?: string;
    text: string;
  }) => {
    const response = await fetch("/api/comments", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: payload.text,
        questionId: payload.qid,
        answerId: payload.aid,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { ok: false, message: data?.message || "Failed to post comment" };
    }

    await refreshQuestions();
    return { ok: true };
  };

  const submitVote = async (
    targetType: "QUESTION" | "ANSWER",
    targetId: string,
    value: "UP" | "DOWN",
  ) => {
    const response = await fetch("/api/votes", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetType, targetId, value }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { ok: false, message: data?.message || "Failed to submit vote" };
    }

    await refreshQuestions();
    return { ok: true };
  };

  const voteQuestion = async (id: string, value: "UP" | "DOWN") =>
    submitVote("QUESTION", id, value);

  const voteAnswer = async (aid: string, value: "UP" | "DOWN") =>
    submitVote("ANSWER", aid, value);

  return (
    <QnAContext.Provider
      value={{
        questions,
        loading,
        currentUser,
        addQuestion,
        addAnswer,
        addComment,
        voteQuestion,
        voteAnswer,
        refreshQuestions,
        refreshMe,
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
