import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const cookie = req.cookies.get("auth")?.value;

  try {
    const res = await fetch(
      `${process.env.FLIGHT_API}/api/content/shared-files`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth=${cookie}`,
        },
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    if (res.status === 401) {
      return NextResponse.json(
        { message: data.message || "Sesión expirada" },
        { status: 401 },
      );
    }

    if (!res.ok) {
      const error = await res.text();
      return new NextResponse(error, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
