import SearchForm from "./SearchForm";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownNotification from "./DropdownNotification";
import User from "./User";
import { IoMenu } from "react-icons/io5";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 flex w-full border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark">
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
              Mi Unidad
            </h1>
            <p className="font-medium dark:text-gray-3">
              👋 Bienvenido de nuevo Usuario 1
            </p>
          </div>
        </div>

        <div className="2xsm:gap-4 flex items-center justify-normal gap-2 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
          <ul className="2xsm:gap-4 flex items-center gap-2">
            <SearchForm />
            <DarkModeSwitcher />
            <DropdownNotification />
          </ul>
          <User />
        </div>
      </div>
    </header>
  );
};

export default Header;
