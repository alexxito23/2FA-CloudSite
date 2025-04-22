"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Progress,
  Spinner,
  Slider,
  Textarea,
} from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

interface DataItem {
  almacenamiento_maximo: number;
  almacenamiento_actual: number;
  tamaño_alerta: number;
}

interface FileItem {
  path: string;
  type: "file" | "folder";
}

interface TreeNode {
  __type: "folder" | "file";
  __children: Record<string, TreeNode>;
}

const formatTree = (items: FileItem[] = []): string => {
  const tree: Record<string, TreeNode> = {};

  // Construimos un árbol en forma de objeto anidado
  items.forEach((item) => {
    const parts = item.path.split("/");
    let current = tree;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      // Solo creamos un nuevo nodo si no existe
      if (!current[part]) {
        current[part] = {
          __type: isLast ? item.type : "folder",
          __children: {},
        };
      }

      current = current[part].__children;
    }
  });

  // Función recursiva para renderizar el árbol en formato texto
  const renderTree = (node: TreeNode, prefix = ""): string[] => {
    const lines: string[] = [];

    Object.entries(node.__children).forEach(([name, value], index, entries) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = isLast ? "    " : "│   ";

      const icon = value.__type === "folder" ? "📁" : "📄";
      lines.push(`${prefix}${connector}${icon} ${name}`);

      const children = renderTree(value, prefix + childPrefix);
      lines.push(...children);
    });

    return lines;
  };

  return renderTree({ __type: "folder", __children: tree }).join("\n");
};

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

const Almacenamiento = () => {
  const [tree, setTree] = useState<FileItem[]>([]);
  const [data, setData] = useState<DataItem>();
  const pathname = usePathname();
  const cookieId = pathname.split("/")[2];
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const totalSize = data?.almacenamiento_maximo ?? 1;
  const usedSize = data?.almacenamiento_actual ?? 0;
  const remainingSize = totalSize - usedSize;
  const alertSize = data?.tamaño_alerta ?? 0;

  const usedPercentage = (usedSize / totalSize) * 100;
  const remainingPercentage = (remainingSize / totalSize) * 100;
  const alertPercentage = (alertSize / totalSize) * 100;

  const remainingColor = remainingPercentage < 15 ? "danger" : "success";
  const alertColor = usedSize >= alertSize ? "danger" : "warning";

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
    const fetchTree = async () => {
      try {
        const res = await fetch("/api/user/get-tree", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setTree(data.items);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      }
    };

    fetchTree();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/user/get-space", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error("Error cargando espacio:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeEnd = async (SliderValue: number | number[]) => {
    const value = Array.isArray(SliderValue) ? SliderValue[0] : SliderValue;
    try {
      const res = await fetch("/api/user/update-alert", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertValue: value }),
      });

      const result = await res.json();
      toast.success(result.message);

      // Realizamos el fetch nuevamente para actualizar la data después de cambiar la alerta
      fetchData();
    } catch (error) {
      // Comprobación para el tipo de error
      if (error instanceof Error) {
        toast.error(`Error actualizando alerta: ${error.message}`);
      } else {
        toast.error("Error desconocido al actualizar alerta");
      }
    }
  };

  return (
    <>
      <Toaster expand richColors position="top-right" />
      <main className="flex h-screen flex-col justify-center dark:bg-dark-2">
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
          <div className="m-4 flex h-[80vh] divide-x-3 divide-solid divide-dark-4 divide-opacity-60 overflow-hidden">
            <div className="box-content flex w-1/3 flex-col items-center justify-center gap-12 overflow-hidden px-4">
              <h1 className="m-4 mt-5 text-2xl font-bold text-dark dark:text-white">
                Mi almacenamiento
              </h1>
              <div className="flex w-1/2 flex-col gap-8">
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between dark:text-white">
                      <p className="font-semibold uppercase dark:text-dark-6">
                        Almacenamiento Usado
                      </p>
                      <p>
                        {data
                          ? `${formatSize(data.almacenamiento_actual)}/${formatSize(data.almacenamiento_maximo)}`
                          : "Cargando..."}
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Progress
                  aria-label="Loading..."
                  className="max-w-md"
                  value={usedPercentage}
                />
              </div>
              <div className="flex w-1/2 flex-col gap-8">
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between dark:text-white">
                      <p className="font-semibold uppercase dark:text-dark-6">
                        Espacio restante
                      </p>
                      <p>
                        {data
                          ? formatSize(
                              data.almacenamiento_maximo -
                                data.almacenamiento_actual,
                            )
                          : "Cargando..."}
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Progress
                  aria-label="Loading..."
                  className="max-w-md"
                  value={remainingPercentage}
                  color={remainingColor}
                />
              </div>
              <div className="flex w-1/2 flex-col gap-8">
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between dark:text-white">
                      <p className="font-semibold uppercase dark:text-dark-6">
                        Tamaño alerta
                      </p>
                      <p>
                        {data ? formatSize(data.tamaño_alerta) : "Cargando..."}
                      </p>
                    </div>
                  </CardBody>
                </Card>
                <Progress
                  aria-label="Loading..."
                  className="max-w-md"
                  color={alertColor}
                  value={alertPercentage}
                />
              </div>
              <Slider
                className="max-w-md"
                value={data ? data.tamaño_alerta / 1073741824 : 4}
                label="Cambiar alerta"
                maxValue={5}
                minValue={1}
                showSteps={true}
                size="md"
                step={1}
                classNames={{
                  base: "dark:text-white font-semibold",
                  label: "text-lg dark:text-dark-6",
                  value: "text-lg",
                }}
                onChangeEnd={(SliderValue) => handleChangeEnd(SliderValue)}
              />
            </div>

            <div className="box-content flex w-2/3 items-center justify-center overflow-hidden">
              <Textarea
                isDisabled
                value={formatTree(tree)}
                label="Árbol Jerárquico"
                classNames={{
                  base: "w-4/5",
                  label: "text-xl mb-2 p-4",
                  input: "min-h-[800px] px-4 font-mono",
                }}
                size="lg"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Almacenamiento;
