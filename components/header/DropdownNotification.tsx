import { useState, useEffect } from "react";
import ClickOutside from "@/components/ClickOutside";
import { BiCheckDouble, BiInfoCircle } from "react-icons/bi";

interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  fecha_creacion: string;
  leida: boolean;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);

  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data: { notificaciones: Notificacion[] }) => {
        setNotifications(data.notificaciones || []);
      })
      .catch((err) => {
        console.error("Error al obtener notificaciones:", err);
      });
  }, []);

  const marcarComoLeida = async (id: number) => {
    try {
      await fetch("/api/user/read-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
        credentials: "include",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, leida: true, fecha_lectura: new Date().toISOString() }
            : n,
        ),
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <ClickOutside
      onClick={() => setDropdownOpen(false)}
      className="relative block"
    >
      <li>
        <div
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
        >
          <div className="relative">
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415ZM12.8137 16.2806C10.9446 16.504 9.05539 16.504 7.18626 16.2806C7.77872 17.1319 8.8092 17.7082 10 17.7082C11.1908 17.7082 12.2213 17.1319 12.8137 16.2806ZM4.79172 7.49984C4.79172 4.62335 7.12357 2.2915 10.0001 2.2915C12.8765 2.2915 15.2084 4.62335 15.2084 7.49984V8.08659C15.2084 8.91414 15.4533 9.72317 15.9124 10.4117L16.8696 11.8475C17.5072 12.804 17.0204 14.104 15.9114 14.4065C12.0412 15.462 7.95893 15.462 4.08872 14.4065C2.9797 14.104 2.49291 12.804 3.13055 11.8475L4.08772 10.4117C4.54676 9.72317 4.79172 8.91414 4.79172 8.08659V7.49984Z"
              />
            </svg>
            <div
              className={`absolute -top-0.5 right-0 z-1 h-2.5 w-2.5 rounded-full border-2 border-gray-2 bg-red-500 dark:border-dark-3 ${
                unreadCount === 0 ? "hidden" : "inline"
              }`}
            >
              <div className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></div>
            </div>
          </div>
        </div>

        {dropdownOpen && (
          <div className="absolute -right-32 z-50 mt-4 flex h-[516px] flex-col rounded-xl border border-stroke bg-white px-5 pb-5 pt-5 shadow-default dark:border-dark-3 dark:bg-gray-dark sm:w-[364px] md:right-0 lg:w-[35rem]">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-medium text-dark dark:text-white">
                Notificaciones
              </h5>
              <span className="text-body-xs rounded-md bg-primary px-2 py-0 font-medium text-white">
                {unreadCount} nuevas
              </span>
            </div>

            <ul className="no-scrollbar mb-5 flex flex-1 flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
              {notifications.map((item, index) => (
                <li key={index}>
                  <div
                    className="mr-4 flex cursor-pointer items-center justify-start gap-4 rounded-[10px] p-2 pl-3 hover:bg-gray-2 dark:hover:bg-dark-3"
                    title={item.leida ? "Leída" : "Marcar como leída"}
                    onClick={() => {
                      if (!item.leida) marcarComoLeida(item.id);
                    }}
                  >
                    <BiInfoCircle
                      size={32}
                      className=" fill-dark dark:fill-white "
                    />
                    <span className="block w-[370px]">
                      <span className="text-body-sm block font-medium text-dark-5 dark:text-dark-6">
                        {item.mensaje}
                      </span>
                    </span>
                    {item.leida && (
                      <BiCheckDouble size={32} className="dark:fill-dark-6" />
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {notifications.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center">
                <h1 className="text-center font-semibold uppercase dark:text-dark-6">
                  Todavía no tienes notificaciones
                </h1>
              </div>
            )}
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
