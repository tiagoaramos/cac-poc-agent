import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_MAX_AGE_SECONDS,
  getAuthConfig,
  hasAuthCredentials,
} from "@/lib/auth/config";
import { secretsEqual } from "@/lib/auth/secrets";
import { createSessionToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasAuthCredentials()) {
    return NextResponse.json(
      {
        error:
          "Configure AUTH_ADMIN_USER e AUTH_ADMIN_PASSWORD no .env.local",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const username = String(body.usuario || "").trim();
  const password = String(body.senha || "");

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuário e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const config = getAuthConfig();
  const userOk = await secretsEqual(username, config.username);
  const passOk = await secretsEqual(password, config.password);

  if (!userOk || !passOk) {
    return NextResponse.json(
      { error: "Usuário ou senha inválidos" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(config.username);
  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true, usuario: config.username });
}
