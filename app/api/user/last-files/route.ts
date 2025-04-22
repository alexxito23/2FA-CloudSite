export async function GET(req: Request) {
  try {
    const res = await fetch("http://localhost:80/api/content/latest-files", {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en API proxy:", error);
    return new Response(
      JSON.stringify({ message: "Error al obtener archivos recientes." }),
      { status: 500 },
    );
  }
}
