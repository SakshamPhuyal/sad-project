import { NextResponse } from "next/server";

import { AUTH_TOKEN_NAME, verifyAuthToken } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const token = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_TOKEN_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/me failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch current user" },
      { status: 500 },
    );
  }
}
