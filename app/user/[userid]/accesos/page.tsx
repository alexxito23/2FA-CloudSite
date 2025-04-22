"use client";
import { Spinner } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdCheckCircle, MdError } from "react-icons/md";

type Favorito = {
  ip_origen: string;
  fecha: string;
  estado: string;
  navegador: string;
};

export default function Profile() {
  const [data, setData] = useState<Favorito[]>([]);
  const pathname = usePathname();
  const cookieId = pathname.split("/")[2];
  const [loading, setLoading] = useState(true);
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
        const res = await fetch("/api/user/history-login", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setData(data.logs);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }
    };

    fetchFavoritos();
  }, []);

  return (
    <main className="h-screen dark:bg-dark-2">
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
            Tu historial de accesos
          </h1>
          <div className="m-4 mt-4 h-[85vh] overflow-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    IP origen
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Agente
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.ip_origen}
                    </td>
                    <td className="px-6 py-4">{item.fecha}</td>
                    <td className="px-6 py-4">{item.navegador}</td>
                    <td className="px-6 py-4">
                      {item.estado === "exitoso" ? (
                        <MdCheckCircle
                          size={24}
                          title={item.estado}
                          className="fill-emerald-500 dark:fill-emerald-700"
                        />
                      ) : (
                        <MdError
                          size={24}
                          title={item.estado}
                          className="fill-red-500 dark:fill-red-700"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && (
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
