"use client"

import { createContext, useContext, useState } from "react"
import { Question } from "@/src/types/type"

interface ContextType {
  questions: Question[]
  addQuestion: (q: Question) => void
  addAnswer: (qid: string, text: string, author: string) => void
  addComment: (qid: string, aid: string, text: string, author: string) => void
  voteQuestion: (id: string, val: number) => void
  voteAnswer: (qid: string, aid: string, val: number) => void
}

const QnAContext = createContext<ContextType | null>(null)

export const QnAProvider = ({ children }: { children: React.ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("questions")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const save = (data: Question[]) => {
    setQuestions(data)
    localStorage.setItem("questions", JSON.stringify(data))
  }

  const addQuestion = (q: Question) => save([...questions, q])

  const voteQuestion = (id: string, val: number) =>
    save(questions.map(q => (q.id === id ? { ...q, votes: q.votes + val } : q)))

  const addAnswer = (qid: string, text: string, author: string) =>
    save(
      questions.map(q =>
        q.id === qid
          ? {
              ...q,
              answers: [
                ...q.answers,
                { id: Date.now().toString(), text, author, votes: 0, comments: [] }
              ]
            }
          : q
      )
    )

  const addComment = (qid: string, aid: string, text: string, author: string) =>
    save(
      questions.map(q =>
        q.id === qid
          ? {
              ...q,
              answers: q.answers.map(a =>
                a.id === aid
                  ? { ...a, comments: [...a.comments, { id: Date.now().toString(), text, author }] }
                  : a
              )
            }
          : q
      )
    )

  const voteAnswer = (qid: string, aid: string, val: number) =>
    save(
      questions.map(q =>
        q.id === qid
          ? {
              ...q,
              answers: q.answers
                .map(a => (a.id === aid ? { ...a, votes: a.votes + val } : a))
                .sort((a, b) => b.votes - a.votes)
            }
          : q
      )
    )

  return (
    <QnAContext.Provider
      value={{ questions, addQuestion, addAnswer, addComment, voteQuestion, voteAnswer }}
    >
      {children}
    </QnAContext.Provider>
  )
}

export const useQnA = () => {
  const context = useContext(QnAContext)
  if (!context) throw new Error("useQnA must be used inside QnAProvider")
  return context
}