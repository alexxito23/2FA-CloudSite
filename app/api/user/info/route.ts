import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {
  const cookieValue = req.cookies.get("auth")?.value;

  if (!cookieValue) {
    return NextResponse.json(
      { error: true, message: "No se encontró la cookie de sesión" },
      { status: 401 },
    );
  }

  try {
    const externalResponse = await fetch(
      "http://localhost:80/api/client/info",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth=${cookieValue}`, // Pasar la cookie al backend externo
        },
        credentials: "include",
      },
    );

    const result = await externalResponse.json();

    if (externalResponse.status === 401) {
      return NextResponse.json(
        { error: true, message: result.message || "Sesión expirada" },
        { status: 401 },
      );
    }

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: true, message: result.message || "Error inesperado" },
        { status: externalResponse.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en el fetch externo:", error);
    return NextResponse.json(
      { error: true, message: "Error al conectar con la API externa" },
      { status: 500 },
    );
  }
};

export { GET };
