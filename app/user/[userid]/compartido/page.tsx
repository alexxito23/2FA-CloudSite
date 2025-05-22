"use client";
import { fetchWithAuth } from "@/hooks/useFetch";
import { logout } from "@/utils/logout";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  MdClose,
  MdDownload,
  MdMoreVert,
  MdOutlineStopScreenShare,
  MdShare,
} from "react-icons/md";
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

type ShareUser = {
  correo: string;
  permiso: "copropietario" | "lector";
};

type SharedFile = {
  nombre: string;
  fecha: string;
  tamaño: number | null;
  permiso: "copropietario" | "lector";
  destinatario_email: string;
  tipo: "archivo" | "directorio";
};

type Resultado = {
  email: string;
  estado: string;
  razon: string;
};

interface FetchCompartidosResponse {
  compartidos: SharedFile[];
}

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
  const [dataLoading, setdataLoading] = useState(true);
  const [cookie, setCookie] = useState<string | null>(null);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filteredData = (
    Array.isArray(comparticiones) ? comparticiones : []
  ).filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      (c.archivo_nombre?.toLowerCase().includes(searchLower) ?? false) ||
      (c.directorio_nombre?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const [shareList, setShareList] = useState<ShareUser[]>([
    { correo: "", permiso: "lector" },
  ]);
  const [shareType, setShareType] = useState<"archivo" | "directorio" | null>(
    null,
  );
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shared, setShared] = useState<SharedFile[]>([]);
  const [shareOwner, setShareOwner] = useState<string>("");
  const [modalAction, setModalAction] = useState<string | null>(null);

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

  const fetchComparticiones = async () => {
    try {
      setdataLoading(true);
      const res = await fetch("/api/user/shared-files", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setComparticiones(data.comparticiones || []);
      setLoading(false); // <-- Agregado para quitar el spinner
    } catch (err) {
      console.error("Error cargando archivos compartidos:", err);
    } finally {
      setdataLoading(false);
    }
  };

  const fetchShared = useCallback(async () => {
    const [error, result] = await fetchWithAuth("/api/user/shared-owner", {
      method: "GET",
    });

    if (error) {
      toast.error(error.message);
      return null;
    }

    if (!result) {
      toast.error("Error en la petición");
      return null;
    }

    const data = result as FetchCompartidosResponse;

    setShared(data.compartidos);
  }, []);

  useEffect(() => {
    fetchComparticiones();
    fetchShared();
  }, [fetchShared]);

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

  const handleShare = (
    nombre: string,
    email: string,
    tipo: "archivo" | "directorio",
  ) => {
    setShareTarget(nombre);
    setShareType(tipo);
    setShareOwner(email);

    const sharedData = shared.filter(
      (file: SharedFile) => file.nombre === nombre && file.tipo === tipo,
    );

    if (sharedData.length > 0) {
      const updatedShareList = sharedData.map((file: SharedFile) => ({
        correo: file.destinatario_email,
        permiso: file.permiso,
      }));
      setShareList(updatedShareList);
    } else {
      setShareList([{ correo: "", permiso: "lector" }]);
    }

    onOpen();
  };

  const handleConfirm = async () => {
    if (modalAction === null && shareTarget && shareType) {
      try {
        const res = await fetch("/api/user/share", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nombre: shareTarget,
            tipo: shareType,
            correos: shareList.map((u) => ({
              correo: u.correo.trim(),
              permiso: u.permiso,
            })),
            directorio: "/",
            propietario: shareOwner,
          }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }

        const data = await res.json();

        toast.success(data.message);
        await fetchShared();

        const resultados = data.resultados as Resultado[];

        if (
          Array.isArray(resultados) &&
          resultados.some((r) => r.estado === "fallo")
        ) {
          const errores = resultados.filter((r) => r.estado === "fallo");

          toast.warning(
            <div>
              <strong>Algunos correos fallaron:</strong>
              <ul>
                {errores.map(({ email, razon }, idx) => (
                  <li key={idx}>
                    {email}: {razon}
                  </li>
                ))}
              </ul>
            </div>,
          );
        }

        onClose();
        setShareTarget(null);
        await fetchComparticiones();
      } catch (err) {
        console.error(err);
        toast.error("Error al compartir ❌");
      }
    } else if (modalAction === "unshare" && shareTarget && shareType) {
      try {
        const res = await fetch("/api/user/revoke-share", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: shareTarget,
            tipo: shareType,
            propietario: shareOwner,
          }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (res.ok) {
          toast.success("Se dejo de compartir con éxito");
          onClose();
          await fetchShared();
          setShareTarget(null);
        } else {
          const err = await res.text();
          toast.error(`Error al eliminar: ${err}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar el directorio ❌");
      } finally {
        setModalAction("");
      }
    }
  };

  const isConfirmDisabled = () => {
    if (modalAction === null) {
      const yaCompartido = shared.some(
        (item) => item.nombre === shareTarget && item.tipo === shareType,
      );

      if (yaCompartido) {
        // Comparar cambios entre shareList actual y datos compartidos previos
        const sharedActual = shared.filter(
          (item) => item.nombre === shareTarget && item.tipo === shareType,
        );

        const actuales = shareList
          .filter((u) => u.correo.trim() !== "")
          .map((u) => ({
            correo: u.correo.trim().toLowerCase(),
            permiso: u.permiso,
          }))
          .sort((a, b) => a.correo.localeCompare(b.correo));

        const previos = sharedActual
          .map((u) => ({
            correo: u.destinatario_email.trim().toLowerCase(),
            permiso: u.permiso,
          }))
          .sort((a, b) => a.correo.localeCompare(b.correo));

        // Detectar cambios reales
        const hayCambios =
          actuales.length !== previos.length ||
          actuales.some(
            (a, i) =>
              a.correo !== previos[i]?.correo ||
              a.permiso !== previos[i]?.permiso,
          );

        return !hayCambios;
      } else {
        // Es nuevo: al menos 2 líneas y un correo válido
        return (
          shareList.length < 1 || shareList.every((u) => u.correo.trim() === "")
        );
      }
    } else {
      return false;
    }
  };

  const isShared = (
    fileName: string,
    fileType: "archivo" | "directorio",
  ): boolean => {
    return shared.some(
      (file) => file.nombre === fileName && file.tipo === fileType,
    );
  };

  const handleUnshare = (
    nombre: string,
    email: string,
    tipo: "archivo" | "directorio",
  ) => {
    setShareTarget(nombre);
    setShareOwner(email);
    setShareType(tipo);
    setModalAction("unshare");
    onOpen();
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
          <div className="m-4 h-[90vh] overflow-hidden [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-dark dark:text-white">
                  Archivos / Directorios compartidos contigo
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
                aria-label="Tabla de compartidos"
                classNames={{
                  wrapper: "dark:bg-gray-800 bg-gray-100",
                  base: "overflow-y-auto",
                  th: "bg-gray-300 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400",
                  emptyWrapper:
                    "text-xl font-bold dark:text-white text-gray-700",
                }}
              >
                <TableHeader>
                  <TableColumn>ARCHIVO/DIRECTORIO</TableColumn>
                  <TableColumn>PROPIETARIO</TableColumn>
                  <TableColumn>FECHA COMPARTICIÓN</TableColumn>
                  <TableColumn>TAMAÑO</TableColumn>
                  <TableColumn>PERMISO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn className="text-center">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody
                  isLoading={dataLoading}
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
                        item.directorio_nombre
                          ? "cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                          : ""
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
                      <TableCell>
                        <p className="text-sm font-medium text-dark dark:text-white">
                          {item.archivo_nombre
                            ? item.archivo_nombre
                            : item.directorio_nombre}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {item.propietario_email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {item.fecha_comparticion}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                          {item.archivo_tamaño
                            ? formatSize(item.archivo_tamaño)
                            : "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-bold text-sm capitalize text-gray-500 dark:text-gray-400">
                          {item.permiso}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color="success"
                          size="sm"
                          variant="flat"
                        >
                          {item.estado}
                        </Chip>
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
                        ) : isShared(
                            item.archivo_nombre ??
                              (item.directorio_nombre as string),
                            item.archivo_nombre ? "archivo" : "directorio",
                          ) ? (
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
                                  onClick={() =>
                                    handleShare(
                                      (item.archivo_nombre ??
                                        item.directorio_nombre) as string,
                                      item.propietario_email,
                                      item.archivo_nombre
                                        ? "archivo"
                                        : "directorio",
                                    )
                                  }
                                >
                                  Compartir
                                </DropdownItem>
                                <DropdownItem
                                  key="unshare"
                                  description={
                                    item.archivo_nombre
                                      ? "Deja de compartir el archivo"
                                      : "Deja de compartir el directorio"
                                  }
                                  startContent={
                                    <MdOutlineStopScreenShare size={24} />
                                  }
                                  onClick={() =>
                                    handleUnshare(
                                      (item.archivo_nombre ??
                                        item.directorio_nombre) as string,
                                      item.propietario_email,
                                      item.archivo_nombre
                                        ? "archivo"
                                        : "directorio",
                                    )
                                  }
                                >
                                  Dejar de compartir
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
                                  onClick={() =>
                                    handleShare(
                                      (item.archivo_nombre ??
                                        item.directorio_nombre) as string,
                                      item.propietario_email,
                                      item.archivo_nombre
                                        ? "archivo"
                                        : "directorio",
                                    )
                                  }
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
          <Modal isOpen={isOpen} size="xl" onClose={onClose}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 dark:text-white">
                    {modalAction !== "unshare" ? (
                      <h1>
                        Compartir{" "}
                        {shareType === "archivo" ? "archivo" : "directorio"}
                      </h1>
                    ) : (
                      <h1>
                        Dejar de compartir{" "}
                        {shareType === "archivo" ? "archivo" : "directorio"}
                      </h1>
                    )}
                  </ModalHeader>
                  <ModalBody className="dark:text-white">
                    {modalAction !== "unshare" ? (
                      <div className="flex flex-col gap-4">
                        {shareList.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="correo@example.com | Nombre grupo"
                              value={item.correo}
                              onChange={(e) => {
                                const updated = [...shareList];
                                updated[index].correo = e.target.value;
                                setShareList(updated);
                              }}
                              className="flex-1"
                              minLength={1}
                              maxLength={40}
                            />
                            <Select
                              defaultSelectedKeys={[item.permiso]}
                              label="Permisos"
                              onChange={(e) => {
                                const updated = [...shareList];
                                updated[index].permiso = e.target.value as
                                  | "lector"
                                  | "copropietario";
                                setShareList(updated);
                              }}
                              size="sm"
                              classNames={{ base: "w-[150px]" }}
                            >
                              <SelectItem
                                className="dark:text-white"
                                key="lector"
                              >
                                Lector
                              </SelectItem>
                              <SelectItem
                                className="dark:text-white"
                                key="copropietario"
                              >
                                Copropietario
                              </SelectItem>
                            </Select>
                            <Button
                              isIconOnly
                              aria-label="Close"
                              color="danger"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updated = shareList.filter(
                                  (_, i) => i !== index,
                                );
                                setShareList(updated);
                              }}
                            >
                              <MdClose size={20} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() =>
                            setShareList([
                              ...shareList,
                              { correo: "", permiso: "lector" },
                            ])
                          }
                          color="primary"
                          variant="flat"
                        >
                          Añadir otro
                        </Button>
                      </div>
                    ) : (
                      <p>
                        ¿Estás seguro de que deseas dejar de compartir{" "}
                        <strong>{shareTarget}</strong>?
                        <br />
                        <small>Todos los usuario dejarán de verlo.</small>
                      </p>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancelar
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleConfirm}
                      isDisabled={isConfirmDisabled()}
                    >
                      Confirmar
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </main>
  );
}
