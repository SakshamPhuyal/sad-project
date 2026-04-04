import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getAuthUserIdFromRequest } from "@/src/lib/server-auth";

function voteCount(
  votes: Array<{
    value: "UP" | "DOWN";
  }>,
) {
  return votes.reduce((sum, vote) => sum + (vote.value === "UP" ? 1 : -1), 0);
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const questions = await prisma.question.findMany({
      where: {
        authorId: userId,
      },
      include: {
        votes: {
          select: { value: true },
        },
        comments: {
          include: {
            author: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        answers: {
          include: {
            author: {
              select: {
                username: true,
                displayName: true,
              },
            },
            votes: {
              select: {
                value: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    username: true,
                    displayName: true,
                  },
                },
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        author: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mapped = questions.map((question) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      tags: Array.isArray(question.tags) ? question.tags : [],
      author: question.author.displayName || question.author.username,
      votes: voteCount(question.votes),
      comments: question.comments.map((comment) => ({
        id: comment.id,
        text: comment.content,
        author: comment.author.displayName || comment.author.username,
      })),
      answers: question.answers.map((answer) => ({
        id: answer.id,
        text: answer.content,
        author: answer.author.displayName || answer.author.username,
        votes: voteCount(answer.votes),
        comments: answer.comments.map((comment) => ({
          id: comment.id,
          text: comment.content,
          author: comment.author.displayName || comment.author.username,
        })),
      })),
    }));

    return NextResponse.json({ success: true, data: mapped }, { status: 200 });
  } catch (error) {
    console.error("GET /api/questions/me failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch your questions" },
      { status: 500 },
    );
  }
}
