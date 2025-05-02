export const logout = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FLIGHT_API}/api/client/logout`,
      {
        method: "GET",
        credentials: "include", // importante para enviar cookies
      },
    );

    if (res.ok) {
      // Logout exitoso
      window.location.href = "/";
    } else {
      console.error("Error al cerrar sesión");
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
