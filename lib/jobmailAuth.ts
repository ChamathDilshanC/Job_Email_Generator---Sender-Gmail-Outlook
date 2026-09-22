import { NextRequest } from "next/server";

export async function getGoogleUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { sub?: string; email?: string };
  return user.sub && user.email ? { id: user.sub, email: user.email } : null;
}
