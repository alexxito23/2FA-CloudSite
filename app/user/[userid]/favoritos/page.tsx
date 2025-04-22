"use client";
import { Spinner } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Favorito = {
  nombre: string;
  tamaño: number;
  fecha: string;
  directorio: string;
};

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`; // Si es menor que 1 KB, mostramos en bytes.
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`; // Si es menor que 1 MB, mostramos en KB.
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`; // Si es menor que 1 GB, mostramos en MB.
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`; // Si es mayor que 1 GB, mostramos en GB.
  }
};

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const pathname = usePathname();
  const cookieId = pathname.split("/")[2];
  const [loading, setLoading] = useState(true);
  const [cookie, setCookie] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        const data = await response.json();
        const userCookie = data?.cookie?.value;

        if (!data?.authenticated) {
          router.push("/"); // 🔐 No autenticado
          return;
        }

        if (cookieId !== userCookie) {
          router.push("/404"); // ❌ No coincide el ID
          return;
        }

        setCookie(userCookie);
        setLoading(false);
      } catch (error) {
        console.error("Error de autenticación:", error);
        router.push("/"); // 🔄 Por seguridad redirigimos
      }
    };

    checkAuth();
  }, [cookieId, router]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await fetch("/api/user/favorite-files", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setFavoritos(data.favoritos);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }
    };

    fetchFavoritos();
  }, []);

  const handleRedirect = (ruta: string) => {
    const rutaCodificada =
      ruta === "/" ? ruta : `/directorio/${encodeURIComponent(ruta.slice(1))}`;
    router.push(`/user/${cookie}${rutaCodificada}`);
  };

  return (
    <main className="h-full dark:bg-dark-2">
      {loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <Spinner
            color="primary"
            label="Cargando"
            classNames={{
              label: "text-4xl font-bold text-dark dark:text-white pt-12",
              wrapper: "scale-[3]",
            }}
          />
          <p className="text-lg text-dark dark:text-white">
            Puede tardar unos minutos...
          </p>
        </div>
      ) : (
        <>
          <h1 className=" m-4 mt-5 text-xl font-bold text-dark dark:text-white">
            Tu unidad
          </h1>
          <div className="m-4 mt-4 h-[48rem] overflow-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Archivo
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Propietario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Ultima modificación
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tamaño
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Ruta
                  </th>
                </tr>
              </thead>
              <tbody>
                {favoritos.map((item, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer border-b bg-white transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    onClick={() => handleRedirect(item.directorio)}
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.nombre}
                    </td>
                    <td className="px-6 py-4">Tú</td>
                    <td className="px-6 py-4">{item.fecha}</td>
                    <td className="px-6 py-4">{formatSize(item.tamaño)}</td>
                    <td className="px-6 py-4">{item.directorio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {favoritos.length === 0 && (
              <h1 className="mt-8 text-center text-3xl font-bold text-white">
                No tienes ficheros en favoritos
              </h1>
            )}
          </div>
        </>
      )}
    </main>
  );
}
