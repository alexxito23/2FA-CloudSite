import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {
  const allowedOrigin = "http://localhost:3000"; // Cambia esto a tu dominio de producción si es necesario
  const origin = req.headers.get("Host");

  // Verificar si la solicitud tiene un encabezado Origin y si coincide con el permitido

  /*const response = await fetch(`http://localhost:80/pr.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "priue",
    }),
  });
  const data = await response.json();*/
  return NextResponse.json({ data: "HOLA" });
};

export { GET };
