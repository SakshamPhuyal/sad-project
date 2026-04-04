import { VoteTargetType, VoteValue } from "@prisma/client";
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
    const targetType =
      body?.targetType === "QUESTION" || body?.targetType === "ANSWER"
        ? (body.targetType as VoteTargetType)
        : null;
    const targetId =
      typeof body?.targetId === "string" ? body.targetId.trim() : "";
    const value =
      body?.value === "UP" || body?.value === "DOWN"
        ? (body.value as VoteValue)
        : null;

    if (!targetType || !targetId || !value) {
      return NextResponse.json(
        {
          success: false,
          message: "targetType, targetId and value are required",
        },
        { status: 400 },
      );
    }

    if (targetType === "QUESTION") {
      const existing = await prisma.vote.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId: targetId,
          },
        },
      });

      if (existing && existing.value === value) {
        await prisma.vote.delete({ where: { id: existing.id } });
      } else if (existing) {
        await prisma.vote.update({
          where: { id: existing.id },
          data: { value },
        });
      } else {
        await prisma.vote.create({
          data: {
            userId,
            targetType,
            value,
            questionId: targetId,
          },
        });
      }
    }

    if (targetType === "ANSWER") {
      const existing = await prisma.vote.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId: targetId,
          },
        },
      });

      if (existing && existing.value === value) {
        await prisma.vote.delete({ where: { id: existing.id } });
      } else if (existing) {
        await prisma.vote.update({
          where: { id: existing.id },
          data: { value },
        });
      } else {
        await prisma.vote.create({
          data: {
            userId,
            targetType,
            value,
            answerId: targetId,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/votes failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit vote" },
      { status: 500 },
    );
  }
}
