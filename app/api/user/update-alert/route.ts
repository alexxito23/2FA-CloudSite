import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.json();
  const cookieValue = req.cookies.get("auth")?.value;

  try {
    const response = await fetch(
      `${process.env.FLIGHT_API}/content/update-alert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth=${cookieValue}`, // Enviamos la cookie al backend de PHP
        },
        body: JSON.stringify(formData),
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
      return NextResponse.json(
        { message: data.message },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar alerta:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
