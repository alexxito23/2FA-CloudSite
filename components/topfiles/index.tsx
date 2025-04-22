"use client";
import { useEffect, useState } from "react";
import TopCardItem from "./TopCardItem";
import { Skeleton } from "@nextui-org/react";

const Topfiles = () => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchArchivos = async () => {
      try {
        const res = await fetch("/api/user/last-files", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Error al cargar archivos recientes");
        }

        const data = await res.json();
        setArchivos(data.archivos || []);
      } catch (error) {
        console.error("Error al obtener archivos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivos();
  }, []);

  const renderSkeletons = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <Skeleton
        key={index}
        className="h-[115px] rounded-lg"
        classNames={{ base: "dark:bg-gray-800" }}
      />
    ));

  return (
    <>
      <h1 className="text-xl font-bold text-dark dark:text-white">
        Últimos Archivos
      </h1>

      <div className="mb-4 mt-4 grid grid-cols-3 gap-4 2xl:hidden">
        {loading
          ? renderSkeletons(3)
          : archivos.slice(0, 3).map((archivo, index) => (
              <div key={index}>
                <TopCardItem content={archivo} />
              </div>
            ))}
        {!loading && archivos.length === 0 && (
          <h1 className="col-span-3 mt-8 text-center text-3xl font-bold text-white">
            Sin Últimos Archivos
          </h1>
        )}
      </div>

      <div className="mb-4 mt-4 hidden grid-cols-6 justify-between gap-6 2xl:grid">
        {loading
          ? renderSkeletons(6)
          : archivos.map((archivo, index) => (
              <div key={index}>
                <TopCardItem content={archivo} />
              </div>
            ))}
        {!loading && archivos.length === 0 && (
          <h1 className="col-span-6 mt-8 text-center text-3xl font-bold text-white">
            Sin Últimos Archivos
          </h1>
        )}
      </div>
    </>
  );
};

export default Topfiles;
