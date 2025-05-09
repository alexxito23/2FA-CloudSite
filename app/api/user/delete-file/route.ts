export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${process.env.FLIGHT_API}/content/delete-file`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Error al eliminar archivo." }),
      { status: 500 },
    );
  }
}
