"use client";
import {
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
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
  const [search, setSearch] = useState("");
  const filteredData = (Array.isArray(favoritos) ? favoritos : []).filter(
    (f) => f?.nombre?.toLowerCase()?.includes(search.toLowerCase()) ?? false,
  );

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
        <div className="m-4 h-[90vh] overflow-hidden [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-dark dark:text-white">
                Archivos / Directorios favoritos
              </h1>

              <Input
                placeholder="Buscar por nombre..."
                value={search}
                onValueChange={setSearch}
                className="w-full max-w-sm"
                classNames={{
                  inputWrapper:
                    "dark:bg-dark dark:data-[focus=true]:bg-dark dark:text-white dark:hover:bg-gray-800",
                }}
              />
            </div>

            <Table
              aria-label="Tabla de usuarios"
              classNames={{
                wrapper: "dark:bg-gray-800 bg-gray-100",
                base: "overflow-y-auto",
                th: "bg-gray-200 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400",
                emptyWrapper: "text-xl font-bold dark:text-white text-gray-700",
              }}
            >
              <TableHeader>
                <TableColumn>ARCHIVO/DIRECTORIO</TableColumn>
                <TableColumn>PROPIETARIO</TableColumn>
                <TableColumn>ÚLTIMA MODIFICACIÓN</TableColumn>
                <TableColumn>TAMAÑO</TableColumn>
                <TableColumn>RUTA</TableColumn>
              </TableHeader>
              <TableBody
                loadingContent={
                  <Spinner
                    color="primary"
                    classNames={{
                      label: "text-xl font-bold dark:text-white text-gray-700",
                    }}
                  />
                }
                emptyContent={"No tienes ficheros en favoritos"}
              >
                {filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    className="h-14 cursor-pointer border-b bg-white transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                    onDoubleClick={() => handleRedirect(item.directorio)}
                  >
                    <TableCell>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        {item.nombre}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-dark dark:text-white">
                        Tú
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                        {item.fecha}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(item.tamaño)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                        {item.directorio}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </main>
  );
}
