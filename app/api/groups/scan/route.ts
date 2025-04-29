import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("auth")?.value;

  try {
    const response = await fetch(
      `http://${process.env.FLIGHT_API}:80/api/content/groups`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth=${cookie}`, // Envía las cookies al backend PHP
        },
        credentials: "include",
      },
    );

    const data = await response.json();
    if (response.status === 401) {
      return NextResponse.json(
        { message: data.message || "Sesión expirada" },
        { status: 401 },
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error en la API de Next.js:", error);
    return NextResponse.json(
      { message: "Error al conectar con el backend" },
      { status: 500 },
    );
  }
}
