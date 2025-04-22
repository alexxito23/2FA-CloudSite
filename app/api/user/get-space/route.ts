export async function GET(req: Request) {
  try {
    const res = await fetch("http://localhost:80/api/content/get-space", {
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
    console.error("Error obteniendo archivos favoritos:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: 500,
      },
    );
  }
}
