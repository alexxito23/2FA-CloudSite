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
import { MdDelete, MdMoreVert, MdShare, MdAdd, MdClose } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
];

export default function App() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const cookieId = pathname.split("/")[2];
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const filteredUsers = grupos.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isReviewModalOpen,
    onOpen: onReviewModalOpen,
    onClose: onReviewModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [emails, setEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

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
        const data = response.json();
        toast.error(data.message ?? "Error al crear el crupo");
      }

      if (response.ok) {
        onCreateModalClose();
        // Aquí podrías actualizar la lista de grupos si es necesario
        setNewGroupName("");
        setNewGroupDescription("");
        setEmails([]);
        toast.success("Grupo creado con éxito");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleFetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(
        `/api/groups/members?groupName=${selectedGroup}`,
      );
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await fetch("/api/groups/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: selectedGroup,
        }),
      });
      onDeleteModalClose();
      // Aquí podrías actualizar la lista de grupos si es necesario
    } catch (error) {
      console.error("Error deleting group:", error);
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

      <Modal isOpen={isReviewModalOpen} onClose={onReviewModalClose}>
        <ModalContent>
          <ModalHeader>Miembros del grupo</ModalHeader>
          <ModalBody>
            {loadingMembers ? (
              <Spinner />
            ) : (
              <div className="flex flex-col gap-2">
                {members.map((member) => (
                  <Chip key={member}>{member}</Chip>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalContent>
          <ModalHeader>Confirmar eliminación</ModalHeader>
          <ModalBody>
            ¿Estás seguro de eliminar el grupo {selectedGroup}?
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
        <div className="m-4 h-[90vh] overflow-hidden [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
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
                      <Chip
                        className="capitalize"
                        color="primary"
                        size="sm"
                        variant="flat"
                      >
                        Tú
                      </Chip>
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
                          <DropdownSection showDivider title="Acciones">
                            <DropdownItem
                              key="revise"
                              description="Revisa el grupo"
                              startContent={<MdShare size={24} />}
                              onClick={() => {
                                setSelectedGroup(user.name);
                                handleFetchMembers();
                                onReviewModalOpen();
                              }}
                            >
                              Revisar
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              description="Elimina el grupo"
                              startContent={<MdDelete size={24} />}
                              onClick={() => {
                                setSelectedGroup(user.name);
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
