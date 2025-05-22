"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Spinner,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import { MdDelete, MdMoreVert, MdAdd, MdClose } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

interface Grupos {
  id: string;
  nombre: string;
  descripcion: string;
  emails: string[];
}

export default function App() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const cookieId = pathname.split("/")[2];
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupos[]>([]);
  const filteredUsers = (Array.isArray(grupos) ? grupos : []).filter(
    (g) => g?.nombre?.toLowerCase()?.includes(search.toLowerCase()) ?? false,
  );

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [dataLoading, setdataLoading] = useState(true);

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

  const scanGroup = useCallback(async () => {
    try {
      setdataLoading(true);
      const response = await fetch("/api/groups/scan", {
        credentials: "include",
      });

      const data = await response.json();

      // Verifica si la respuesta contiene los grupos
      if (data?.grupos) {
        setGrupos(data.grupos); // Guarda los grupos en el estado
      } else {
        toast.error("No tienes grupos activos");
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
    } finally {
      setdataLoading(false);
    }
  }, []);

  useEffect(() => {
    scanGroup();
  }, [scanGroup]);

  const handleCreateGroup = async () => {
    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          emails: emails,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message ?? "Error al crear el crupo");
      }

      if (response.ok) {
        onCreateModalClose();
        // Aquí podrías actualizar la lista de grupos si es necesario
        setNewGroupName("");
        setNewGroupDescription("");
        await scanGroup();
        setEmails([]);
        toast.success("Grupo creado con éxito");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await fetch("/api/groups/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedGroup,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message ?? "Error al crear el crupo");
        return;
      }

      await scanGroup();
      toast.success("Grupo eliminado correctamente");
      onDeleteModalClose();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Error al eliminar el grupo");
    }
  };

  const addEmail = () => {
    if (currentEmail && !emails.includes(currentEmail)) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
    }
  };

  return (
    <main className="h-screen dark:bg-dark-2">
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose} size="xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 dark:text-white">
            Crear nuevo grupo
          </ModalHeader>
          <ModalBody className="dark:text-white">
            <Input
              label="Nombre del grupo"
              value={newGroupName}
              onValueChange={setNewGroupName}
              size="sm"
              minLength={1}
              maxLength={40}
            />
            <Textarea
              label="Descripción"
              value={newGroupDescription}
              onValueChange={setNewGroupDescription}
              size="sm"
            />
            <div className="flex flex-col gap-2">
              <Input
                label="Añadir correos"
                value={currentEmail}
                onValueChange={setCurrentEmail}
                onKeyDown={(e) => e.key === "Enter" && addEmail()}
                size="sm"
                minLength={1}
                maxLength={40}
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
              />
              <Button onClick={addEmail} startContent={<MdAdd />}>
                Añadir correo
              </Button>
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <Chip
                    key={email}
                    endContent={
                      <MdClose
                        onClick={() =>
                          setEmails(emails.filter((e) => e !== email))
                        }
                      />
                    }
                  >
                    {email}
                  </Chip>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCreateModalClose}>Cancelar</Button>
            <Button color="primary" onClick={handleCreateGroup}>
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="xl">
        <ModalContent>
          <ModalHeader className="dark:text-white">
            Confirmar eliminación
          </ModalHeader>
          <ModalBody className="dark:text-white">
            <p>
              ¿Estás seguro de que deseas eliminar el archivo{" "}
              <strong>{selectedGroup}</strong>?
              <br />
              <small>Esta acción no se puede deshacer.</small>
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDeleteModalClose}>Cancelar</Button>
            <Button color="danger" onClick={handleDeleteGroup}>
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
        <div className="m-4 h-[89vh] overflow-hidden [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-dark dark:text-white">
                Grupos creados
              </h1>

              <div className="flex items-center justify-center gap-4">
                <Button
                  color="primary"
                  variant="solid"
                  onClick={onCreateModalOpen}
                >
                  + Nuevo
                </Button>
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
              aria-label="Tabla de usuarios"
              classNames={{
                wrapper: "dark:bg-gray-800 bg-gray-100 h-[85vh]",
                base: "overflow-y-auto",
                th: "bg-gray-200 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400",
                emptyWrapper: "text-xl font-bold dark:text-white text-gray-700",
              }}
            >
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn>PROPIETARIO</TableColumn>
                <TableColumn className="text-center">ACCIONES</TableColumn>
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
                emptyContent={"No tienes grupos creados"}
              >
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="text-sm font-medium dark:text-white">
                        {user.nombre}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-bold text-sm capitalize text-gray-500 dark:text-gray-400">
                        {user.descripcion}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.emails.map((item, index) => (
                          <Chip
                            color="primary"
                            size="sm"
                            variant="flat"
                            key={index}
                          >
                            {item}
                          </Chip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            aria-label="Actions"
                          >
                            <MdMoreVert
                              size={28}
                              className="text-default-300"
                            />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Acciones"
                          className="dark:text-white"
                        >
                          <DropdownSection>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              description="Elimina el grupo"
                              startContent={<MdDelete size={24} />}
                              onClick={() => {
                                setSelectedGroup(user.nombre);
                                onDeleteModalOpen();
                              }}
                            >
                              Eliminar
                            </DropdownItem>
                          </DropdownSection>
                        </DropdownMenu>
                      </Dropdown>
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
