import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const DOMINIO_PERMITIDO = "https://www.cloudblock.cloud";
  const isApiRoute = pathname.startsWith("/api");
  const isUserRoute = pathname.startsWith("/user");
  const authCookie = req.cookies.get("auth");

  // 1. Protección de rutas /user/*
  if (isUserRoute) {
    if (!authCookie) {
      console.log("❌ Acceso no autorizado a ruta protegida /user");
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. Protección de rutas API
  if (isApiRoute) {
    // Obtener IP y headers
    const clientIP =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "127.0.0.1";

    // Permitir IPs locales
    const isLocalNetwork = [
      "127.0.0.1",
      "::1",
      "192.168.",
      "10.",
      "172.16.",
    ].some((ip) => clientIP.startsWith(ip));

    if (isLocalNetwork) {
      console.log("✅ Acceso API permitido: IP local");
      return NextResponse.next();
    }

    // Verificar origen de la solicitud
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const isFetchRequest = req.headers
      .get("accept")
      ?.includes("application/json");

    // Validar origen permitido
    const isValidOrigin = origin === DOMINIO_PERMITIDO;
    const isValidReferer = referer?.startsWith(DOMINIO_PERMITIDO);

    // Bloquear acceso directo desde navegador
    const userAgent = req.headers.get("user-agent") || "";
    const isBrowserDirectAccess =
      userAgent.includes("Mozilla") && !isFetchRequest;

    if (isBrowserDirectAccess) {
      console.log("❌ Bloqueado: Acceso directo desde navegador a API");
      return NextResponse.redirect(new URL("/404", req.url));
    }

    // Validar solicitudes externas
    if (!isValidOrigin && !isValidReferer) {
      console.log("❌ Origen no permitido para API:", origin);
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/user/:path*"],
};
