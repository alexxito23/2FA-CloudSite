import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {
  const cookieValue = req.cookies.get("auth")?.value;
  const formData = await req.json();

  if (!cookieValue) {
    return NextResponse.json(
      { error: true, message: "No se encontró la cookie de sesión" },
      { status: 401 },
    );
  }
  try {
    const response = await fetch(
      `${process.env.FLIGHT_API}/api/content/scan-dir`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth=${cookieValue}`,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      },
    );

    const data = await response.json();

    if (response.status === 401) {
      return NextResponse.json(
        { error: true, message: data.message || "Sesión expirada" },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message || "Error inesperado" },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Desconocido",
      },
      { status: 500 },
    );
  }
};

export { POST };
