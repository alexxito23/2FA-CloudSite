import { type NextRequest, NextResponse } from "next/server";
import https from "https";
import type { IncomingMessage, IncomingHttpHeaders } from "http";

interface HttpResponse {
  statusCode: number | undefined;
  headers: IncomingHttpHeaders;
  body: string;
}

export const maxDuration = 420; // 7 minutos

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";

    const responsePromise = new Promise<HttpResponse>((resolve, reject) => {
      const options = {
        hostname: process.env.FLIGHT_API_DOMAIN,
        port: 443,
        path: "/auth/check-login",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          Connection: "keep-alive",
          "Keep-Alive": "timeout=420",
        },
        timeout: 7 * 60 * 1000,
        rejectUnauthorized: false,
      };

      console.log("Iniciando solicitud HTTPS con timeout de 7 minutos...");

      const httpsRequest = https.request(options, (res: IncomingMessage) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log("Respuesta completa recibida");
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      });

      httpsRequest.on("error", (error) => {
        console.error("Error en la solicitud HTTPS:", error);
        reject(error);
      });

      httpsRequest.on("timeout", () => {
        console.log("Timeout alcanzado después de 7 minutos");
        httpsRequest.destroy();
        reject(new Error("La solicitud ha excedido el tiempo de espera"));
      });

      httpsRequest.end();
    });

    console.log("Esperando respuesta...");

    const response = await responsePromise;

    console.log("Respuesta recibida:", response.statusCode);

    if (response.statusCode !== 200) {
      let errorMessage = "Error en la validación";
      try {
        const errorData = JSON.parse(response.body);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.log(e);
      }

      return NextResponse.json(
        { message: errorMessage },
        { status: response.statusCode || 500 },
      );
    }

    const nextResponse = NextResponse.json(
      { message: "Registro completado" },
      { status: 200 },
    );

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
