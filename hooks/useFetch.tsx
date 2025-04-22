import { logout } from "@/utils/logout";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit,
): Promise<[Error?, never?]> => {
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (res.status === 401) {
      logout();
      return [new Error("Sesión Caducada")];
    }

    if (!res.ok) {
      const json = await res.json();
      return [new Error(json.message ?? "Error al hacer la petición")];
    }

    const json = await res.json();
    return [undefined, json];
  } catch (error) {
    if (error instanceof Error) return [error];
  }
  return [new Error("Error desconocido")];
};
