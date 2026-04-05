import { NextResponse } from "next/server";

import {
  AUTH_TOKEN_NAME,
  createAuthToken,
  getAuthCookieOptions,
  verifyPassword,
} from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier =
      typeof body?.identifier === "string"
        ? body.identifier.trim().toLowerCase()
        : typeof body?.email === "string"
          ? body.email.trim().toLowerCase()
          : typeof body?.username === "string"
            ? body.username.trim()
            : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "identifier and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = createAuthToken(user.id);
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
        },
      },
      { status: 200 },
    );
    response.cookies.set(AUTH_TOKEN_NAME, token, getAuthCookieOptions());
    return response;
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to login", error },
      { status: 500 },
    );
  }
}
