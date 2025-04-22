import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get("auth");

  if (!authCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json(
    { authenticated: true, cookie: authCookie },
    { status: 200 },
  );
}
