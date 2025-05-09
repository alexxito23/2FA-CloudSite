import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieValue = req.cookies.get("auth")?.value;

  try {
    const res = await fetch(`${process.env.FLIGHT_API}/content/unshared`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth=${cookieValue}`,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      const data = await res.json();
      return NextResponse.json(
        { message: data.message || "Sesión expirada" },
        { status: 401 },
      );
    }

    if (!res.ok) {
      const error = await res.text();
      return new NextResponse(error, { status: res.status });
    }
    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error compartiendo:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
