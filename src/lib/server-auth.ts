import { AUTH_TOKEN_NAME, verifyAuthToken } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

function readTokenFromCookieHeader(cookieHeader: string) {
  const tokenPart = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_TOKEN_NAME}=`));

  if (!tokenPart) return null;
  return tokenPart.slice(AUTH_TOKEN_NAME.length + 1);
}

export async function getAuthUserIdFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readTokenFromCookieHeader(cookieHeader);
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true },
  });

  return user?.id ?? null;
}
