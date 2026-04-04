import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  AUTH_TOKEN_NAME,
  createAuthToken,
  getAuthCookieOptions,
  hashPassword,
} from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const displayName =
      typeof body?.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim()
        : null;

    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "email, username, and password are required",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    const token = createAuthToken(user.id);
    const response = NextResponse.json(
      { success: true, user },
      { status: 201 },
    );
    response.cookies.set(AUTH_TOKEN_NAME, token, getAuthCookieOptions());
    return response;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "email or username already exists" },
        { status: 409 },
      );
    }

    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register" },
      { status: 500 },
    );
  }
}
