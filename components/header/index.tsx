import SearchForm from "./SearchForm";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownNotification from "./DropdownNotification";
import User from "./User";
import { IoMenu } from "react-icons/io5";
import { useEffect, useState } from "react";
import { Skeleton } from "@nextui-org/react";
import { logout } from "@/utils/logout";

interface UserInfo {
  nombre: string;
  apellidos: string;
  email: string;
}

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [data, setData] = useState<UserInfo>();
  const [loading, setLoading] = useState(true); // Agregamos un estado de carga

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/user/info", {
          method: "GET",
          credentials: "include", // 👈 importante para que se envíen las cookies
        });

        if (response.status === 401) {
          logout(); // Ejecutar logout si la sesión ha expirado
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Error en la petición");
        }

        const result = await response.json();
        setData(result.usuario);
        setLoading(false); // Establecer a falso una vez que los datos se cargan
      } catch (err) {
        console.error((err as Error).message);
        setLoading(false); // Asegurarse de cambiar el estado si hay un error
      }
    };

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-50 flex w-full border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark">
      <div className="shadow-2 flex flex-grow items-center justify-between px-4 py-5 md:px-5 2xl:px-10">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-10 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-dark-3 dark:bg-dark-2 lg:hidden"
          >
            <IoMenu size={28} color={"#9CA3AF"} />
          </button>
        </div>

        <div className="hidden xl:block">
          <div>
            <h1 className="mb-0.5 text-2xl font-bold text-dark dark:text-white">
              Mi CloudBlock
            </h1>
            <Skeleton
              className="w-full rounded-lg"
              isLoaded={!loading}
              classNames={{ base: "dark:bg-gray-800" }}
            >
              <p className="font-medium dark:text-gray-3">
                👋 Bienvenido de nuevo{" "}
                <span className="capitalize">{data?.nombre}</span>
              </p>
            </Skeleton>
          </div>
        </div>

        <div className="2xsm:gap-4 flex items-center justify-normal gap-2 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
          <ul className="2xsm:gap-4 flex items-center gap-2">
            <SearchForm />
            <DarkModeSwitcher />
            <DropdownNotification />
          </ul>
          <Skeleton
            className="w-32 rounded-lg"
            isLoaded={!loading}
            classNames={{ base: "dark:bg-gray-800" }}
          >
            <User
              nombre={data?.nombre ?? "-"}
              apellidos={data?.apellidos ?? "-"}
              email={data?.email ?? "-"}
            />
          </Skeleton>
        </div>
      </div>
    </header>
  );
};

export default Header;
