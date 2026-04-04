import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getAuthUserIdFromRequest } from "@/src/lib/server-auth";

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
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    const questionId =
      typeof body?.questionId === "string" ? body.questionId.trim() : "";
    const answerId =
      typeof body?.answerId === "string" ? body.answerId.trim() : "";

    if (!content || (!questionId && !answerId)) {
      return NextResponse.json(
        { success: false, message: "content and target are required" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        questionId: questionId || null,
        answerId: answerId || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create comment" },
      { status: 500 },
    );
  }
}
