import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

export async function handleRegistration(formData: {
  name: string;
  lastname: string;
  email: string;
  password: string;
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al enviar el formulario");
  }

  if (!data.expiration || !data.token) {
    throw new Error(data.message || "Error al obtener metadatos");
  }

  toast.success(data.message || "Usuario registrado con éxito");

  return { token: data.token, expiration: data.expiration };
}

export async function handleLogin(formData: {
  email: string;
  password: string;
}) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al enviar el formulario");
  }

  if (!data.expiration || !data.token) {
    throw new Error(data.message || "Error al obtener metadatos");
  }

  toast.success(data.message || "Inicio de sesión con éxito");

  return { token: data.token, expiration: data.expiration };
}

export async function validateToken(
  token: string,
  router: AppRouterInstance,
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void,
) {
  try {
    const checkTokenResponse = await fetch("/api/auth/validate", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const checkTokenData = await checkTokenResponse.json();

    if (!checkTokenResponse.ok) {
      throw new Error(checkTokenData.message || "Error al validar el token");
    }

    toast.success(checkTokenData.message || "Token validado correctamente");

    const sessionResponse = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    const sessionData = await sessionResponse.json();

    if (sessionData.authenticated) {
      toast.success("Autenticado correctamente. Redirigiendo...");
      const userCookie = sessionData.cookie.value;
      if (userCookie) {
        // Si la cookie existe, redirige a /user/{cookie_value}
        router.push(`/user/${userCookie}`);
      } else {
        throw new Error("No se encontró la cookie de usuario.");
      }
    } else {
      throw new Error("Error: No se encontró la cookie de sesión.");
    }
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Error en la validación del token",
    );
    setAppStatus("error");
  }
}

export async function validateLogin(
  token: string,
  router: AppRouterInstance,
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void,
) {
  try {
    const checkTokenResponse = await fetch("/api/auth/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const checkTokenData = await checkTokenResponse.json();

    if (!checkTokenResponse.ok) {
      throw new Error(checkTokenData.message || "Error al validar el token");
    }

    toast.success(checkTokenData.message || "Token validado correctamente");

    const sessionResponse = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    const sessionData = await sessionResponse.json();

    if (sessionData.authenticated) {
      toast.success("Autenticado correctamente. Redirigiendo...");
      const userCookie = sessionData.cookie.value;
      if (userCookie) {
        // Si la cookie existe, redirige a /user/{cookie_value}
        router.push(`/user/${userCookie}`);
      } else {
        throw new Error("No se encontró la cookie de usuario.");
      }
    } else {
      throw new Error("Error: No se encontró la cookie de sesión.");
    }
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Error en la validación del token",
    );
    setAppStatus("error");
  }
}

export async function handlePass(formData: { email: string }) {
  const response = await fetch("/api/auth/pass", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al enviar el formulario");
  }

  if (!data.expiration || !data.token) {
    throw new Error(data.message || "Error al obtener metadatos");
  }

  toast.success(data.message || "Generación token correcta");

  return { token: data.token, expiration: data.expiration };
}

export async function validateEmail(
  token: string,
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void,
) {
  try {
    const checkTokenResponse = await fetch("/api/auth/check-pass", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const checkTokenData = await checkTokenResponse.json();

    if (!checkTokenResponse.ok) {
      throw new Error(checkTokenData.message || "Error al validar el token");
    }

    toast.success(checkTokenData.message || "Token validado correctamente");
    setAppStatus("pass");
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Error en la validación del token",
    );
    setAppStatus("error");
  }
}

export async function handleChange(
  formData: {
    email: string;
    password: string;
  },
  router: AppRouterInstance,
  token: string,
) {
  const response = await fetch("/api/auth/change-pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al enviar el formulario");
  }

  toast.success(data.message || "Cambio de contraseña correcto");
  router.push("/");
  return { message: data.message };
}
