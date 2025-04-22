import { type NextRequest, NextResponse } from "next/server";
import http from "http";
import type { IncomingMessage, IncomingHttpHeaders } from "http";

// Definir una interfaz para la respuesta HTTP
interface HttpResponse {
  statusCode: number | undefined;
  headers: IncomingHttpHeaders;
  body: string;
}

// Aumentamos el tiempo máximo de duración a 7 minutos (420 segundos)
export const maxDuration = 420; // 7 minutos en segundos (para Next.js)

export async function GET(req: NextRequest) {
  try {
    console.log("Haciendo la solicitud a la API...");

    // Obtener el token de autorización
    const authHeader = req.headers.get("Authorization") || "";

    // Crear una promesa que se resuelve cuando la solicitud HTTP se completa
    const responsePromise = new Promise<HttpResponse>((resolve, reject) => {
      // Configurar opciones para la solicitud HTTP
      const options = {
        hostname: "localhost",
        port: 80,
        path: "/api/auth/check-login",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          // Añadir headers para evitar cierres prematuros de conexión
          Connection: "keep-alive",
          "Keep-Alive": "timeout=420", // 7 minutos
        },
        // Aumentamos el timeout a 7 minutos
        timeout: 7 * 60 * 1000, // 7 minutos en milisegundos
      };

      console.log("Iniciando solicitud HTTP con timeout de 7 minutos...");

      // Crear la solicitud HTTP
      const httpRequest = http.request(options, (res: IncomingMessage) => {
        let data = "";

        // Recopilar datos de la respuesta
        res.on("data", (chunk) => {
          data += chunk;
        });

        // Cuando la respuesta está completa
        res.on("end", () => {
          console.log("Respuesta completa recibida");
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      // Manejar errores de la solicitud
      httpRequest.on("error", (error) => {
        console.error("Error en la solicitud HTTP:", error);
        reject(error);
      });

      // Configurar timeout específico para la solicitud
      httpRequest.on("timeout", () => {
        console.log("Timeout alcanzado después de 10 minutos");
        httpRequest.destroy();
        reject(
          new Error(
            "La solicitud ha excedido el tiempo de espera de 10 minutos",
          ),
        );
      });

      // Finalizar la solicitud
      httpRequest.end();
    });

    console.log("Esperando respuesta (puede tardar hasta 10 minutos)...");

    // Esperar a que la solicitud se complete
    const response = await responsePromise;

    console.log("Respuesta recibida:", response.statusCode);

    // Procesar la respuesta
    if (response.statusCode !== 200) {
      let errorMessage = "Error en la validación";
      try {
        const errorData = JSON.parse(response.body);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no se puede analizar como JSON, usar el mensaje predeterminado
        console.log(e);
      }

      return NextResponse.json(
        { message: errorMessage },
        { status: response.statusCode || 500 },
      );
    }

    // Crear la respuesta en Next.js
    const nextResponse = NextResponse.json(
      { message: "Inicio de sesión completado" },
      { status: 200 },
    );

    // Transferir cookies si existen
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      nextResponse.headers.set(
        "Set-Cookie",
        Array.isArray(setCookieHeader)
          ? setCookieHeader.join(", ")
          : setCookieHeader,
      );
    }

    return nextResponse;
  } catch (error) {
    console.error("Error durante la solicitud:", error);

    if (error instanceof Error) {
      if (error.message.includes("tiempo de espera")) {
        return NextResponse.json(
          {
            message: "El tiempo de espera de la solicitud ha expirado",
            error: error.message,
          },
          { status: 408 },
        );
      }

      return NextResponse.json(
        {
          message: "Error interno del servidor",
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Error desconocido",
        error: "Desconocido",
      },
      { status: 500 },
    );
  }
}
