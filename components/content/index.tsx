"use client";

import { logout } from "@/utils/logout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  useDisclosure,
  Input,
  Button as NextUIButton,
  DropdownSection,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  MdClose,
  MdDelete,
  MdDownload,
  MdFolderShared,
  MdMoreVert,
  MdOutlineArrowBackIos,
  MdOutlineStopScreenShare,
  MdShare,
} from "react-icons/md";
import { toast } from "sonner";
import ThemeSwitch from "./ThemeSwitch";
import { fetchWithAuth } from "@/hooks/useFetch";

interface FileDetails {
  nombre: string;
  tamano: string;
  modificacion: string;
  tipo: "Archivo" | "Directorio"; // "directorio" o "archivo"
}

interface ContentProps {
  contenido: FileDetails[];
}

interface FileContentProps {
  cookie: string;
  directorio: string;
}

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

interface DirectoryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

const DirectoryInput: React.FC<DirectoryInputProps> = (props) => {
  return <input {...props} />;
};

const FileContent = ({ cookie, directorio }: FileContentProps) => {
  const [data, setData] = useState<ContentProps>({ contenido: [] });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [newDirName, setNewDirName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [favoritos, setFavoritos] = useState<{ [key: string]: boolean }>({});
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const [shareType, setShareType] = useState<"archivo" | "directorio" | null>(
    null,
  );
  const [shareList, setShareList] = useState<ShareUser[]>([
    { correo: "", permiso: "lector" },
  ]);
  const [shared, setShared] = useState<SharedFile[]>([]);

  const router = useRouter();
  const [dataLoading, setdataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const filteredData = (
    Array.isArray(data.contenido) ? data.contenido : []
  ).filter(
    (d) => d?.nombre?.toLowerCase()?.includes(search.toLowerCase()) ?? false,
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setdataLoading(true);
    const [error, result] = await fetchWithAuth("/api/user/scan-dir", {
      method: "POST",
      body: JSON.stringify({ directorio }),
    });

    if (error) {
      toast.error(error.message);
      setTimeout(() => {
        router.push(`/user/${cookie}`);
      }, 0);
      setLoading(false);
      setdataLoading(false);
      return;
    }

    if (!result) return toast.error("Error en la petición");

    setData(result);
    setLoading(false);
    setdataLoading(false);
  }, [cookie, directorio, router]);

  const fetchShared = useCallback(async () => {
    const [error, result] = await fetchWithAuth("/api/user/compartidos", {
      method: "POST",
      body: JSON.stringify({ directorio }),
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!result) return toast.error("Error en la petición");

    setShared(result);
  }, [directorio]);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
      await fetchShared();
    };

    loadData();
  }, [fetchData, fetchShared]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const res = await fetch("/api/user/favorite-files", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        const favMap: { [key: string]: boolean } = {};
        data.favoritos.forEach(
          (file: { nombre: string; directorio: string }) => {
            const key = `${file.directorio.replace(/^\/+/, "")}/${file.nombre}`;
            favMap[key] = true;
          },
        );
        console.log(favMap);
        setFavoritos(favMap);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }
    };

    fetchFavoritos();
  }, []);

  const handleAction = (key: string) => {
    setModalAction(key);
    onOpen();
  };

  const handleDeleteRequest = (nombre: string) => {
    setDeleteTarget(nombre);
    setModalAction("deleteDir");
    onOpen();
  };

  const handleDeleteFileRequest = (nombre: string) => {
    setDeleteTarget(nombre);
    setModalAction("deleteFile");
    onOpen();
  };

  const isShared = (
    fileName: string,
    fileType: "archivo" | "directorio",
  ): boolean => {
    return shared.some(
      (file) => file.nombre === fileName && file.tipo === fileType,
    );
  };

  const handleConfirm = async () => {
    if (modalAction === "createDir") {
      if (!newDirName.trim()) {
        toast.warning("Escribe un nombre válido");
        return;
      }

      try {
        const res = await fetch("/api/user/create-dir", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre: newDirName, directorio }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Error al crear directorio");
        }

        toast.success("Directorio creado correctamente ✅");
        setNewDirName("");
        onClose();
        await fetchData();
      } catch (err) {
        console.error(err);
        toast.error("No se pudo crear el directorio ❌");
      }
    } else if (modalAction === "deleteDir" && deleteTarget) {
      try {
        const res = await fetch("/api/user/delete-dir", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: deleteTarget,
            directorio: directorio,
          }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (res.ok) {
          toast.success("Directorio eliminado correctamente ✅");
          onClose();
          await fetchData();
        } else {
          const err = await res.text();
          toast.error(`Error al eliminar: ${err}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar el directorio ❌");
      }
    } else if (modalAction === "deleteFile" && deleteTarget) {
      try {
        const res = await fetch("/api/user/delete-file", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: deleteTarget,
            directorio: directorio,
          }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (res.ok) {
          toast.success("Directorio eliminado correctamente ✅");
          onClose();
          await fetchData();
        } else {
          const err = await res.text();
          toast.error(`Error al eliminar: ${err}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar el directorio ❌");
      }
    } else if (modalAction === "uploadFile") {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast.warning("Debes seleccionar al menos un archivo");
        return;
      }

      try {
        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => {
          formData.append("files[]", file);
        });
        formData.append("directorio", directorio);

        const res = await fetch("/api/user/encrypt-upload", {
          method: "POST",
          credentials: "include",
          body: formData,
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

        if (res.status === 207) {
          toast.warning(data.errors);
          toast.warning(data.message);
          return;
        }

        toast.success(data.message);
        onClose();
        await fetchData();
        setSelectedFiles(null);
      } catch (err) {
        console.error(err);
        toast.error("Error al subir los archivos ❌");
      }
    } else if (modalAction === "uploadDir") {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast.warning("Debes seleccionar una carpeta con archivos");
        return;
      }

      const formData = new FormData();

      Array.from(selectedFiles).forEach((file) => {
        formData.append("files[]", file);
        formData.append(
          "paths[]",
          (file as File).webkitRelativePath || file.name,
        );
      });

      formData.append("directorio", directorio);

      try {
        const res = await fetch("/api/user/encrypt-dir-upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (res.status === 401) {
          toast.error("No autorizado. Cierra sesión y vuelve a entrar.");
          return;
        }

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }

        toast.success("Carpeta subida y encriptada correctamente ✅");
        onClose();
        setSelectedFiles(null);
        await fetchData();
      } catch (err) {
        console.error(err);
        toast.error("Error al subir la carpeta ❌");
      }
    } else if (modalAction === "share" && shareTarget && shareType) {
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
            directorio: directorio,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }

        toast.success("Compartido correctamente ✅");
        onClose();
        setShareTarget(null);
        await fetchData();
        await fetchShared();
      } catch (err) {
        console.error(err);
        toast.error("Error al compartir ❌");
      }
    } else if (modalAction === "unshare" && shareTarget && shareType) {
      try {
        const res = await fetch("/api/user/unshare", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: shareTarget,
            tipo: shareType,
            directorio: directorio,
          }),
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (res.ok) {
          toast.success("Se dejo de compartir con éxito");
          onClose();
          await fetchData();
          await fetchShared();
          setShareTarget(null);
        } else {
          const err = await res.text();
          toast.error(`Error al eliminar: ${err}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al dejar de compartir ❌");
      }
    }
  };

  const renderModalTitle = () => {
    switch (modalAction) {
      case "createDir":
        return "Crear directorio";
      case "uploadDir":
        return "Subir directorio";
      case "uploadFile":
        return "Subir ficheros";
      case "deleteDir":
        return "Eliminar directorio";
      case "deleteFile":
        return "Eliminar archivo";
      case "share":
        return `Compartir ${shareType === "archivo" ? "archivo" : "directorio"}`;
      case "unshare":
        return `Dejar de compartir ${shareType === "archivo" ? "archivo" : "directorio"}`;
      default:
        return "";
    }
  };

  const getFileLabel = () => {
    if (!selectedFiles || selectedFiles.length === 0) return "";
    const firstName = selectedFiles[0].name;
    const rest = selectedFiles.length - 1;
    return rest > 0 ? `${firstName}, +${rest} más` : firstName;
  };

  const renderModalContent = () => {
    switch (modalAction) {
      case "createDir":
        return (
          <Input
            label="Nombre del directorio"
            placeholder="Ej. Mis documentos"
            variant="bordered"
            className="mt-2"
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
            minLength={1}
            maxLength={40}
          />
        );
      case "uploadDir":
        return (
          <div className="mt-2">
            <DirectoryInput
              type="file"
              webkitdirectory="true"
              directory=""
              className="hidden"
              id="upload-dir"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const folderName = files[0]?.webkitRelativePath.split("/")[0];
                const fileArray = Array.from(files);

                // Verificamos nombre de la carpeta
                const folderNameValid =
                  folderName &&
                  folderName.length >= 1 &&
                  folderName.length <= 40;

                // Verificamos cada archivo dentro del directorio
                const allFileNamesValid = fileArray.every((file) => {
                  const fileName = file.name;
                  return fileName.length > 1 && fileName.length < 40;
                });

                if (folderNameValid && allFileNamesValid) {
                  setSelectedFiles(files);
                } else {
                  alert(
                    "El nombre de la carpeta y todos los archivos deben tener entre 1 y 40 caracteres.",
                  );
                  e.target.value = ""; // limpia selección inválida
                }
              }}
            />
            <label htmlFor="upload-dir">
              <NextUIButton as="span" color="primary" variant="flat">
                Seleccionar carpeta
              </NextUIButton>
            </label>
            <span className="pl-4 text-gray-500 dark:text-white">
              {selectedFiles?.[0]?.webkitRelativePath.split("/")[0]}
            </span>
          </div>
        );
      case "uploadFile":
        return (
          <div className="mt-2">
            <input
              type="file"
              multiple
              className="hidden"
              id="upload-file"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const fileArray = Array.from(files);
                const allNamesValid = fileArray.every(
                  (file) => file.name.length >= 1 && file.name.length <= 40,
                );

                if (allNamesValid) {
                  setSelectedFiles(files);
                } else {
                  alert(
                    "Todos los archivos deben tener nombres entre 1 y 40 caracteres.",
                  );
                  e.target.value = "";
                }
              }}
            />
            <label htmlFor="upload-file">
              <NextUIButton as="span" color="primary" variant="flat">
                Seleccionar archivos
              </NextUIButton>
            </label>
            <span className="pl-4 text-gray-500 dark:text-white">
              {getFileLabel()}
            </span>
          </div>
        );
      case "deleteDir":
        return (
          <p>
            ¿Estás seguro de que deseas eliminar el directorio{" "}
            <strong>{deleteTarget}</strong>?
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </p>
        );
      case "deleteFile":
        return (
          <p>
            ¿Estás seguro de que deseas eliminar el archivo{" "}
            <strong>{deleteTarget}</strong>?
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </p>
        );
      case "share":
        return (
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
                  <SelectItem className="dark:text-white" key="lector">
                    Lector
                  </SelectItem>
                  <SelectItem className="dark:text-white" key="copropietario">
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
                    const updated = shareList.filter((_, i) => i !== index);
                    setShareList(updated);
                  }}
                >
                  <MdClose size={20} />
                </Button>
              </div>
            ))}
            <NextUIButton
              onClick={() =>
                setShareList([...shareList, { correo: "", permiso: "lector" }])
              }
              color="primary"
              variant="flat"
            >
              Añadir otro
            </NextUIButton>
          </div>
        );
      case "unshare":
        return (
          <p>
            ¿Estás seguro de que deseas dejar de compartir{" "}
            <strong>{shareTarget}</strong>?
            <br />
            <small>Todos los usuario dejarán de verlo.</small>
          </p>
        );
      default:
        return null;
    }
  };

  const isConfirmDisabled = () => {
    switch (modalAction) {
      case "createDir":
        return newDirName.trim() === "";
      case "uploadFile":
      case "uploadDir":
        return !selectedFiles || selectedFiles.length === 0;
      case "share":
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
            shareList.length < 1 ||
            shareList.every((u) => u.correo.trim() === "")
          );
        }

      default:
        return false;
    }
  };

  const handleRedirect = (nombre: string) => {
    if (directorio === "/") {
      router.push(`/user/${cookie}/directorio/${nombre}`);
    } else {
      router.push(
        `/user/${cookie}/directorio/${encodeURIComponent(directorio)}%2F${nombre}`,
      );
    }
  };

  const handleGoBack = () => {
    const parts = directorio.split("/");
    parts.pop();
    const previous = parts.join("%2F");
    if (previous !== "") {
      router.push(`/user/${cookie}/directorio/${previous}`);
    } else {
      router.push(`/user/${cookie}/${previous}`);
    }
  };

  const estaEnSubdirectorio = directorio.trim() !== "/";

  const handleDownload = async (nombre: string, directorio: string) => {
    try {
      const res = await fetch("/api/user/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, directorio }),
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
    directorio: string,
    tipo: "archivo" | "directorio",
  ) => {
    setShareTarget(nombre);
    setShareType(tipo);

    const sharedData = shared.filter(
      (file) => file.nombre === nombre && file.tipo === tipo,
    );

    // Si ya estaba compartido, poblar los datos reales
    if (sharedData.length > 0) {
      const updatedShareList = sharedData.map((file) => ({
        correo: file.destinatario_email,
        permiso: file.permiso,
      }));
      setShareList(updatedShareList);
    } else {
      // Si es nuevo, dejar al menos una línea vacía
      setShareList([{ correo: "", permiso: "lector" }]);
    }

    setModalAction("share");
    onOpen();
  };

  const handleUnshare = (nombre: string, tipo: "archivo" | "directorio") => {
    setShareTarget(nombre);
    setShareType(tipo);
    setModalAction("unshare");
    onOpen();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="mt-4">
          <h1 className="text-xl font-bold text-dark dark:text-white">
            Mi unidad
          </h1>
          <span className="font-semibold text-default-500">
            {directorio !== "/" ? `/${directorio}` : directorio}
          </span>
        </div>

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
          <Dropdown>
            <DropdownTrigger>
              <Button color="primary" variant="solid">
                + Nuevo
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Opciones de archivo"
              onAction={(key) => handleAction(key as string)}
              className="dark:text-white"
            >
              <DropdownItem key="createDir">Crear directorio</DropdownItem>
              <DropdownItem key="uploadDir">Subir directorio</DropdownItem>
              <DropdownItem key="uploadFile">Subir ficheros</DropdownItem>
            </DropdownMenu>
          </Dropdown>
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

      <Skeleton
        className="mt-4 h-[69.5vh] rounded-lg"
        isLoaded={!loading}
        classNames={{ base: "dark:bg-gray-800" }}
      >
        <div className="mt-4 max-h-[69.5vh] overflow-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
          <Table
            aria-label="Tabla de archivos o directorios"
            classNames={{
              wrapper: "dark:bg-gray-800 bg-gray-100",
              base: "overflow-y-auto",
              th: "bg-gray-300 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400",
              emptyWrapper: "text-xl font-bold dark:text-white text-gray-700",
            }}
            className="text-gray-500 dark:text-gray-400 rtl:text-right"
          >
            <TableHeader>
              <TableColumn>ARCHIVO/DIRECTORIO</TableColumn>
              <TableColumn>PROPIETARIO</TableColumn>
              <TableColumn>ÚLTIMA MODIFICACIÓN</TableColumn>
              <TableColumn>TAMAÑO</TableColumn>
              <TableColumn width={200}>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={dataLoading}
              loadingContent={
                <Spinner
                  color="primary"
                  classNames={{
                    label: "text-xl font-bold dark:text-white text-gray-700",
                  }}
                />
              }
              emptyContent={"Directorio Vacío"}
            >
              {filteredData.map((item, index) => (
                <TableRow
                  key={index}
                  className={`border-b bg-white dark:border-gray-700 dark:bg-gray-800 ${
                    item.tipo === "Directorio" &&
                    "cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onDoubleClick={() =>
                    item.tipo === "Directorio" && handleRedirect(item.nombre)
                  }
                >
                  <TableCell>
                    <p className="text-sm font-medium text-dark dark:text-white">
                      {item.nombre}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                        Tú
                      </p>
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                      {item.modificacion}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-bold text-sm text-gray-500 dark:text-gray-400">
                      {item.tamano}
                    </p>
                  </TableCell>
                  <TableCell className="flex items-center gap-4 px-6 py-4">
                    {isShared(
                      item.nombre,
                      item.tipo.toLocaleLowerCase() as "archivo" | "directorio",
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
                                item.tipo === "Archivo"
                                  ? "Descarga el archivo"
                                  : "Descarga el directorio"
                              }
                              onClick={() =>
                                handleDownload(item.nombre, directorio)
                              }
                              startContent={<MdDownload size={24} />}
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
                              onClick={() =>
                                handleShare(
                                  item.nombre,
                                  directorio,
                                  item.tipo.toLocaleLowerCase() as
                                    | "archivo"
                                    | "directorio",
                                )
                              }
                              startContent={<MdShare size={24} />}
                            >
                              Compartir
                            </DropdownItem>
                            <DropdownItem
                              key="unshare"
                              description={
                                item.tipo === "Archivo"
                                  ? "Deja de compartir el archivo"
                                  : "Deja de compartir el directorio"
                              }
                              onClick={() =>
                                handleUnshare(
                                  item.nombre,
                                  item.tipo.toLocaleLowerCase() as
                                    | "archivo"
                                    | "directorio",
                                )
                              }
                              startContent={
                                <MdOutlineStopScreenShare size={24} />
                              }
                            >
                              Dejar de Compartir
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              description={
                                item.tipo === "Archivo"
                                  ? "Elimina el archivo"
                                  : "Elimina el directorio"
                              }
                              startContent={<MdDelete size={24} />}
                              onClick={() => {
                                if (item.tipo === "Archivo") {
                                  handleDeleteFileRequest(item.nombre);
                                } else if (item.tipo === "Directorio") {
                                  handleDeleteRequest(item.nombre);
                                }
                              }}
                            >
                              Eliminar
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
                              onClick={() =>
                                handleDownload(item.nombre, directorio)
                              }
                              startContent={<MdDownload size={24} />}
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
                              onClick={() =>
                                handleShare(
                                  item.nombre,
                                  directorio,
                                  item.tipo.toLocaleLowerCase() as
                                    | "archivo"
                                    | "directorio",
                                )
                              }
                              startContent={<MdShare size={24} />}
                            >
                              Compartir
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              description={
                                item.tipo === "Archivo"
                                  ? "Elimina el archivo"
                                  : "Elimina el directorio"
                              }
                              startContent={<MdDelete size={24} />}
                              onClick={() => {
                                if (item.tipo === "Archivo") {
                                  handleDeleteFileRequest(item.nombre);
                                } else if (item.tipo === "Directorio") {
                                  handleDeleteRequest(item.nombre);
                                }
                              }}
                            >
                              Eliminar
                            </DropdownItem>
                          </DropdownSection>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                    {item.tipo === "Archivo" && (
                      <ThemeSwitch
                        fileName={item.nombre}
                        directory={directorio}
                        seleccionado={
                          favoritos[
                            directorio
                              ? `${directorio.replace(/^\/+/, "")}/${item.nombre}`
                              : item.nombre
                          ] || false
                        }
                      />
                    )}
                    {isShared(
                      item.nombre,
                      item.tipo.toLocaleLowerCase() as "archivo" | "directorio",
                    ) && <MdFolderShared size={24} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Skeleton>

      <Modal isOpen={isOpen} size="xl" onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 dark:text-white">
                {renderModalTitle()}
              </ModalHeader>
              <ModalBody className="dark:text-white">
                {renderModalContent()}
              </ModalBody>
              <ModalFooter>
                <NextUIButton color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </NextUIButton>
                <NextUIButton
                  color="primary"
                  onPress={handleConfirm}
                  isDisabled={isConfirmDisabled()}
                >
                  Confirmar
                </NextUIButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileContent;
