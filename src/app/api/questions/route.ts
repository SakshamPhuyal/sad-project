import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(
      { success: true, data: questions },
      { status: 200 },
    );
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
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : typeof body?.question === "string"
          ? body.question.trim()
          : "";
    const authorIdInput =
      typeof body?.authorId === "string" ? body.authorId.trim() : "";

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "title and description are required",
        },
        { status: 400 },
      );
    }

    const author = authorIdInput
      ? await prisma.user.findUnique({ where: { id: authorIdInput } })
      : await prisma.user.upsert({
          where: { email: "guest@example.com" },
          update: {},
          create: {
            email: "guest@example.com",
            username: "guest",
            passwordHash: "guest-password-hash",
            displayName: "Guest",
          },
        });

    if (!author) {
      return NextResponse.json(
        { success: false, message: "Author not found" },
        { status: 404 },
      );
    }

    const tags = Array.isArray(body?.tags)
      ? body.tags.filter((tag: unknown) => typeof tag === "string")
      : [];

    const createdQuestion = await prisma.question.create({
      data: {
        title,
        description,
        authorId: author.id,
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
