export async function POST(req: Request) {
  const { nombre, directoryName, email } = await req.json();

  const res = await fetch(`${process.env.FLIGHT_API}/content/shared-download`, {
    method: "POST",
    headers: {
      Cookie: req.headers.get("cookie") || "",
    },
    body: new URLSearchParams({ nombre, directoryName, email }),
  });

  if (!res.ok) {
    const error = await res.text();
    return new Response(error, { status: res.status });
  }

  const blob = await res.blob();

  return new Response(blob, {
    headers: {
      "Content-Type":
        res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") || "",
    },
  });
}
