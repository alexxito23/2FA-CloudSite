import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // **✅ Obtener IP real sin confiar en `x-forwarded-for`**
  const clientIP =
    req.headers.get("x-real-ip") || // En servidores proxy/Nginx
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || // En despliegues cloud
    "127.0.0.1"; // Fallback en localhost
  console.log("📌 IP Cliente:", clientIP);

  // **✅ Permitir solo IPs locales**
  const isLocalNetwork = clientIP === "127.0.0.1" || clientIP === "::1";

  if (!isLocalNetwork) {
    console.log("❌ IP no permitida, bloqueando acceso.");
    return NextResponse.redirect(new URL("/404", req.url));
  }

  // **✅ Bloquear navegadores pero permitir `fetch`**
  const userAgent = req.headers.get("user-agent") || "";
  const isBrowser = userAgent.includes("Mozilla");
  const hasFetchHeaders = req.headers.get("sec-fetch-mode") === "cors";

  if (isBrowser && !hasFetchHeaders) {
    console.log("❌ Acceso desde navegador bloqueado.");
    return NextResponse.redirect(new URL("/404", req.url));
  }

  // **✅ Verificar autenticación con cookie**
  const authCookie = req.cookies.get("auth");
  const protectedRoutes = ["/user"];

  if (
    protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) &&
    !authCookie
  ) {
    console.log("❌ Sin cookie de autenticación, redirigiendo al login.");
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log("✅ Acceso permitido.");
  return NextResponse.next();
}

// **🔹 Configuración del middleware**
export const config = {
  matcher: ["/api/:path*", "/user/:path*"],
};
