import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("http://localhost:80/api/auth/check-token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
      credentials: "include", // Necesario para recibir cookies
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Error en la validación" },
        { status: response.status },
      );
    }

    // Extraer cookies de la respuesta PHP
    const setCookieHeader = response.headers.get("set-cookie");

    // Crear la respuesta en Next.js y setear la cookie manualmente
    const nextResponse = NextResponse.json(
      { message: "Registro completado" },
      { status: 200 },
    );

    if (setCookieHeader) {
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Desconocido",
      },
      { status: 500 },
    );
  }
}
