import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Obtener la ruta solicitada
  const { pathname } = req.nextUrl;

  // Verificar si es una ruta de API
  const isApiRoute = pathname.startsWith("/api");

  // Obtener IP real del cliente
  const clientIP =
    req.headers.get("x-real-ip") || // En servidores proxy/Nginx
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || // En despliegues cloud
    "127.0.0.1"; // Fallback en localhost

  console.log(`📌 Solicitud a ${pathname} desde IP: ${clientIP}`);

  // Verificar si es una IP local/interna
  const isLocalNetwork =
    clientIP === "127.0.0.1" ||
    clientIP === "::1" ||
    clientIP.startsWith("192.168.") ||
    clientIP.startsWith("10.") ||
    clientIP.startsWith("172.16.");

  // Si es una ruta de API, aplicar restricciones adicionales
  if (isApiRoute) {
    // Siempre permitir acceso desde IPs locales
    if (isLocalNetwork) {
      console.log("✅ Acceso permitido: IP local");
      return NextResponse.next();
    }

    // Obtener información sobre el origen de la solicitud
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent") || "";

    // Verificar si la solicitud viene de nuestra propia aplicación
    const isSameOrigin =
      origin &&
      (origin.includes(req.headers.get("host") || "") ||
        // Añadir aquí otros dominios permitidos si es necesario
        origin === "https://tu-dominio-permitido.com");

    const isRefererFromApp =
      referer &&
      (referer.includes(req.headers.get("host") || "") ||
        // Añadir aquí otros dominios permitidos si es necesario
        referer.startsWith("https://tu-dominio-permitido.com"));

    // Verificar si es una solicitud fetch legítima
    const isFetchRequest =
      req.headers.get("sec-fetch-mode") === "cors" ||
      req.headers.get("sec-fetch-mode") === "no-cors" ||
      req.headers.get("accept")?.includes("application/json");

    // Verificar si es un navegador intentando acceder directamente
    const isBrowserDirectAccess =
      userAgent.includes("Mozilla") &&
      !isFetchRequest &&
      !isSameOrigin &&
      !isRefererFromApp;

    // Bloquear navegadores intentando acceder directamente a la API
    if (isBrowserDirectAccess) {
      console.log(
        "❌ Acceso bloqueado: Navegador externo intentando acceder directamente a la API",
      );
      return NextResponse.redirect(new URL("/404", req.url));
    }

    // Permitir solicitudes fetch desde nuestra aplicación
    if (isFetchRequest && (isSameOrigin || isRefererFromApp)) {
      console.log(
        "✅ Acceso permitido: Solicitud fetch desde nuestra aplicación",
      );
      return NextResponse.next();
    }

    // Para solicitudes que no cumplen con los criterios anteriores
    if (!isLocalNetwork && !isSameOrigin && !isRefererFromApp) {
      console.log("❌ Acceso bloqueado: Origen no permitido");
      return NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 },
      );
    }
  }

  // Verificar autenticación con cookie para rutas protegidas
  const authCookie = req.cookies.get("auth");
  const protectedRoutes = ["/user"];

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !authCookie
  ) {
    console.log("❌ Sin cookie de autenticación, redirigiendo al login");
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("✅ Acceso permitido");
  return NextResponse.next();
}

// Configuración del middleware
export const config = {
  matcher: ["/api/:path*", "/user/:path*"],
};
