import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {
  try {
    const formData = await req.json();
    const token = req.headers.get("authorization");

    const response = await fetch(`http://localhost:80/api/auth/change-pass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

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
