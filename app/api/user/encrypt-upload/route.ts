export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Si no es multipart/form-data, devolver error
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Tipo de contenido inválido", { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files[]");
    const directorio = formData.get("directorio");

    const phpForm = new FormData();
    files.forEach((file) => {
      if (file instanceof File) {
        phpForm.append("files[]", file);
      }
    });

    if (directorio) phpForm.append("directorio", directorio);

    const res = await fetch(
      `${process.env.FLIGHT_API}/api/content/encrypt-upload`,
      {
        method: "POST",
        body: phpForm,
        headers: {
          Cookie: req.headers.get("cookie") || "", // Reenvía la cookie
        },
      },
    );

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response("Error interno al subir archivos", { status: 500 });
  }
}
