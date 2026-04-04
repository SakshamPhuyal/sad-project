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

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
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
    console.error("GET /api/questions failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : typeof body?.question === "string"
          ? body.question.trim()
          : "";

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "title and description are required",
        },
        { status: 400 },
      );
    }

    const tags = Array.isArray(body?.tags)
      ? body.tags.filter((tag: unknown) => typeof tag === "string")
      : [];

    const createdQuestion = await prisma.question.create({
      data: {
        title,
        description,
        authorId: userId,
        tags,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: createdQuestion },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/questions failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create question" },
      { status: 500 },
    );
  }
}
