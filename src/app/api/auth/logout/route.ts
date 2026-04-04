import { NextResponse } from "next/server";

import { AUTH_TOKEN_NAME, getAuthCookieOptions } from "@/src/lib/auth";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set(AUTH_TOKEN_NAME, "", {
      ...getAuthCookieOptions(),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to logout" },
      { status: 500 },
    );
  }
}
