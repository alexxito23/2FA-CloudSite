"use client";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spinner,
} from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdDownload, MdMoreVert, MdShare } from "react-icons/md";
import { toast } from "sonner";

type Comparticion = {
  comparticion_id: number;
  fecha_comparticion: string;
  permiso: string;
  estado: string;
  propietario_email: string;
  directorio_id: number | null;
  directorio_nombre: string | null;
  directorio_ruta_padre: number | null;
  archivo_id: number | null;
  archivo_nombre: string | null;
  archivo_tamaño: number | null;
  archivo_fecha: string | null;
  directorio_ruta: string;
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

export default function Compartido() {
  const [comparticiones, setComparticiones] = useState<Comparticion[]>([]);
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
    const fetchComparticiones = async () => {
      try {
        // Cambié la URL de la API para obtener archivos compartidos
        const res = await fetch("/api/user/shared-files", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setComparticiones(data.comparticiones); // Asegúrate que la respuesta tenga la propiedad comparticiones
      } catch (err) {
        console.error("Error cargando archivos compartidos:", err);
      }
    };

    fetchComparticiones();
  }, []);

  const handleRedirect = (ruta: string, email: string) => {
    const rutaCodificada =
      ruta === "/" ? ruta : `%2F${encodeURIComponent(ruta)}`;
    router.push(`/user/${cookie}/compartido/${email}${rutaCodificada}`);
  };

  const handleDownload = async (
    nombre: string,
    directoryName: string,
    email: string,
  ) => {
    try {
      const res = await fetch("/api/user/shared-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, directoryName, email }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message);
        return;
      }

      const blob = await res.blob();

      // Obtener el nombre del archivo desde el encabezado "Content-Disposition"
      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = nombre;

      if (contentDisposition) {
        // Asegurarse de extraer el nombre del archivo correctamente
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace para iniciar la descarga
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // Aquí el nombre de archivo debería estar correctamente establecido
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Revocar el objeto URL para liberar recursos
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error en la descarga:", err);
      toast.error("Hubo un error al descargar el archivo.");
    }
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
            Archivos y Directorios compartidos contigo
          </h1>
          <div className="m-4 mt-4 h-[48rem] overflow-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Archivo/Directorio
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Propietario
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Fecha Compartición
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tamaño
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Permiso
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparticiones.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b bg-white dark:border-gray-700 dark:bg-gray-800 ${
                      item.directorio_nombre &&
                      "cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                    onDoubleClick={() => {
                      if (item.directorio_nombre) {
                        handleRedirect(
                          item.directorio_nombre,
                          item.propietario_email,
                        );
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.archivo_nombre
                        ? item.archivo_nombre
                        : item.directorio_nombre}
                    </td>
                    <td className="px-6 py-4">{item.propietario_email}</td>
                    <td className="px-6 py-4">{item.fecha_comparticion}</td>
                    <td className="px-6 py-4">
                      {item.archivo_tamaño
                        ? formatSize(item.archivo_tamaño)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 capitalize">{item.permiso}</td>
                    <td className="px-6 py-4">
                      <Chip
                        className="capitalize"
                        color="success"
                        size="sm"
                        variant="flat"
                      >
                        {item.estado}
                      </Chip>
                    </td>
                    <td className="text-center">
                      {item.permiso === "lector" ? (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              aria-label="Actions"
                              className="data-[hover=true]:bg-gray-4 dark:data-[hover=true]:bg-gray-7"
                            >
                              <MdMoreVert
                                size={28}
                                className="text-default-600"
                              />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Acciones"
                            className="dark:text-white"
                          >
                            <DropdownSection showDivider title="Acciones">
                              <DropdownItem
                                key="download"
                                description={
                                  item.archivo_nombre
                                    ? "Descarga el archivo"
                                    : "Descarga el directorio"
                                }
                                startContent={<MdDownload size={24} />}
                                onClick={() =>
                                  handleDownload(
                                    (item.archivo_nombre ??
                                      item.directorio_nombre) as string,
                                    item.directorio_ruta,
                                    item.propietario_email,
                                  )
                                }
                              >
                                Descargar
                              </DropdownItem>
                            </DropdownSection>
                          </DropdownMenu>
                        </Dropdown>
                      ) : (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              aria-label="Actions"
                              className="data-[hover=true]:bg-gray-4 dark:data-[hover=true]:bg-gray-7"
                            >
                              <MdMoreVert
                                size={28}
                                className="text-default-600"
                              />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Acciones"
                            className="dark:text-white"
                          >
                            <DropdownSection showDivider title="Acciones">
                              <DropdownItem
                                key="download"
                                description={
                                  item.archivo_nombre
                                    ? "Descarga el archivo"
                                    : "Descarga el directorio"
                                }
                                startContent={<MdDownload size={24} />}
                                onClick={() =>
                                  handleDownload(
                                    (item.archivo_nombre ??
                                      item.directorio_nombre) as string,
                                    decodeURIComponent(item.directorio_ruta),
                                    item.propietario_email,
                                  )
                                }
                              >
                                Descargar
                              </DropdownItem>
                              <DropdownItem
                                key="share"
                                description={
                                  item.archivo_nombre
                                    ? "Comparte el archivo"
                                    : "Comparte el directorio"
                                }
                                startContent={<MdShare size={24} />}
                              >
                                Compartir
                              </DropdownItem>
                            </DropdownSection>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comparticiones.length === 0 && (
              <h1 className="mt-8 text-center text-3xl font-bold text-white">
                No tienes archivos o directorios compartidos
              </h1>
            )}
          </div>
        </>
      )}
    </main>
  );
}
