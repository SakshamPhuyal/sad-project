import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getAuthUserIdFromRequest } from "@/src/lib/server-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: questionId } = await params;
    const body = await request.json();
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!questionId || !content) {
      return NextResponse.json(
        { success: false, message: "question id and content are required" },
        { status: 400 },
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 },
      );
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: userId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ success: true, data: answer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions/[id]/answers failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create answer" },
      { status: 500 },
    );
  }
}
