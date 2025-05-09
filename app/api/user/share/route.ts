import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieValue = req.cookies.get("auth")?.value;

  const { nombre, tipo, correos, directorio, propietario } = body;

  // Validar formato
  if (!Array.isArray(correos) || correos.length === 0) {
    return new NextResponse("Debes proporcionar al menos un correo", {
      status: 400,
    });
  }

  // Validar cada correo + permiso
  const invalidEntry = correos.find(
    (c) =>
      !c.correo ||
      typeof c.correo !== "string" ||
      !["copropietario", "lector"].includes(c.permiso),
  );

  if (invalidEntry) {
    return new NextResponse("Formato de correo o permiso inválido", {
      status: 400,
    });
  }

  try {
    const res = await fetch(`${process.env.FLIGHT_API}/content/shared`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth=${cookieValue}`,
      },
      credentials: "include",
      body: JSON.stringify({
        nombre,
        tipo,
        correos,
        directorio,
        propietario,
      }),
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
