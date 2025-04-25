import { NextResponse } from "next/server";

const GET = async () => {
  try {
    // Llama al backend PHP (ajusta la URL según tu entorno)
    const response = await fetch(
      `http://${process.env.FLIGHT_API}:80/api/client/logout`,
      {
        method: "GET",
        credentials: "include", // Para enviar cookies si tu backend lo necesita
      },
    );

    if (response.ok) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      const data = await response.json();
      return NextResponse.json(
        { success: false, error: data?.message || "Logout failed" },
        { status: response.status },
      );
    }
  } catch (err) {
    console.error("Error al llamar al backend PHP:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 },
    );
  }
};

export { GET };
