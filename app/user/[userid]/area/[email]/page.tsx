"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdDownload,
  MdMoreVert,
  MdOutlineArrowBackIos,
  MdShare,
} from "react-icons/md";
import { toast, Toaster } from "sonner";

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

interface SharedItem {
  nombre: string;
  tamano: string; // "N/A" o tamaño en bytes
  modificacion: string; // Formato: "YYYY-MM-DD HH:mm:ss"
  tipo: "Archivo" | "Directorio";
  permiso: string;
}

export default function DirectoryContent() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split("/");

  const cookieId = parts[2];
  const encodedData = parts[4];
  const decodedData = decodeURIComponent(encodedData);
  const [email, ...directoryParts] = decodedData.split("/");
  const directoryName =
    directoryParts.length > 0 ? directoryParts.join("/") : "/";

  const [loading, setLoading] = useState(true);
  const [cookie, setCookie] = useState<string | null>(null);
  const [data, setData] = useState<SharedItem[]>([]);
  const [search, setSearch] = useState("");
  const filteredData = (Array.isArray(data) ? data : []).filter(
    (d) => d?.nombre?.toLowerCase()?.includes(search.toLowerCase()) ?? false,
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
          router.push("/");
          return;
        }

        if (cookieId !== userCookie) {
          router.push("/404");
          return;
        }

        setCookie(userCookie);
        setLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/");
      }
    };

    checkAuth();
  }, [cookieId, router, cookie]);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await fetch("/api/user/shared-dir", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            directorio: decodeURIComponent(directoryName),
            email: email,
          }),
        });
        const data = await res.json();
        setData(data.contenido);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }
    };

    fetchShared();
  }, [directoryName, email]);

  const handleRedirect = (ruta: string) => {
    const rutaCodificada =
      ruta === "/" ? ruta : `${directoryName}%2F${encodeURIComponent(ruta)}`;
    router.push(`${encodeURIComponent(`${email}/${rutaCodificada}`)}`);
  };

  const handleGoBack = () => {
    const parts = decodeURIComponent(directoryName).split("/");
    parts.pop();
    const previous = parts.join("%2F");
    if (previous !== "") {
      router.push(`/user/${cookie}/area/${email}%2F${previous}`);
    } else {
      router.push(`/user/${cookie}/area`);
    }
  };

  const estaEnSubdirectorio = decodeURIComponent(directoryName).trim() !== "/";

  const handleDownload = async (nombre: string) => {
    try {
      const res = await fetch("/api/user/shared-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          directoryName: decodeURIComponent(directoryName),
          email,
        }),
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
    <>
      <Toaster expand richColors position="top-right" />
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
                  Archivos / Directorios compartidos contigo
                </h1>

                <div className="flex items-center justify-center gap-4">
                  {estaEnSubdirectorio && (
                    <Button
                      isIconOnly
                      aria-label="Take a photo"
                      color="primary"
                      variant="ghost"
                      onClick={handleGoBack}
                      size="sm"
                    >
                      <MdOutlineArrowBackIos size={22} />
                    </Button>
                  )}
                  <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onValueChange={setSearch}
                    className="w-96 max-w-sm"
                    classNames={{
                      inputWrapper:
                        "dark:bg-dark dark:data-[focus=true]:bg-dark dark:text-white dark:hover:bg-gray-800",
                    }}
                  />
                </div>
              </div>

              <Table
                aria-label="Tabla de directorios o archivos compartidos"
                classNames={{
                  wrapper: "dark:bg-gray-800 bg-gray-100",
                  base: "overflow-y-auto",
                  th: "bg-gray-200 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400",
                  emptyWrapper:
                    "text-xl font-bold dark:text-white text-gray-700",
                }}
              >
                <TableHeader>
                  <TableColumn>ARCHIVO/DIRECTORIO</TableColumn>
                  <TableColumn>PROPIETARIO</TableColumn>
                  <TableColumn>FECHA COMPARTICIÓN</TableColumn>
                  <TableColumn>TAMAÑO</TableColumn>
                  <TableColumn className="text-center">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody
                  loadingContent={
                    <Spinner
                      color="primary"
                      classNames={{
                        label:
                          "text-xl font-bold dark:text-white text-gray-700",
                      }}
                    />
                  }
                  emptyContent={"No tienes archivos o directorios compartidos"}
                >
                  {filteredData.map((item, index) => (
                    <TableRow
                      key={index}
                      className={`border-b bg-white dark:border-gray-700 dark:bg-gray-800 ${
                        item.tipo === "Directorio"
                          ? "cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                          : ""
                      }`}
                      onDoubleClick={() => {
                        if (item.tipo === "Directorio") {
                          handleRedirect(item.nombre);
                        }
                      }}
                    >
                      <TableCell>
                        <p className="text-sm font-medium text-dark dark:text-white">
                          {item.nombre}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {item.modificacion}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {item.tamano !== "N/A"
                            ? formatSize(parseInt(item.tamano))
                            : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
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
                                    item.tipo === "Archivo"
                                      ? "Descarga el archivo"
                                      : "Descarga el directorio"
                                  }
                                  startContent={<MdDownload size={24} />}
                                  onClick={() => handleDownload(item.nombre)}
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
                                    item.tipo === "Archivo"
                                      ? "Descarga el archivo"
                                      : "Descarga el directorio"
                                  }
                                  startContent={<MdDownload size={24} />}
                                  onClick={() => handleDownload(item.nombre)}
                                >
                                  Descargar
                                </DropdownItem>
                                <DropdownItem
                                  key="share"
                                  description={
                                    item.tipo === "Archivo"
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
