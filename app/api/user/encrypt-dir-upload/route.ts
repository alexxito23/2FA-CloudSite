export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return new Response("Tipo de contenido inválido", { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files[]");
    const paths = formData.getAll("paths[]");
    const directorio = formData.get("directorio");

    const phpForm = new FormData();

    files.forEach((file, index) => {
      if (file instanceof File) {
        phpForm.append("files[]", file);
        if (paths[index]) {
          phpForm.append("paths[]", paths[index]);
        }
      }
    });

    if (directorio) phpForm.append("directorio", directorio);

    const res = await fetch(
      `${process.env.FLIGHT_API}/api/content/encrypt-folder-upload`,
      {
        method: "POST",
        body: phpForm,
        headers: {
          Cookie: req.headers.get("cookie") || "",
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
    return new Response("Error interno al subir carpeta", { status: 500 });
  }
}
