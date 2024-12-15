import { FaChartPie } from "react-icons/fa";
import {
  MdDashboard,
  MdFolderShared,
  MdStorage,
  MdOutlineStar,
  MdGroups,
} from "react-icons/md";

export const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: <MdDashboard size={24} />,
        label: "Menu",
        route: "#",
      },
      {
        icon: <MdFolderShared size={24} />,
        label: "Compartido Conmigo",
        route: "/compartido",
      },
      {
        icon: <MdStorage size={24} />,
        label: "Mi Unidad",
        route: "/unidad",
      },
      {
        icon: <MdOutlineStar size={24} />,
        label: "Favoritos",
        route: "/favoritos",
      },
      {
        icon: <MdGroups size={24} />,
        label: "Areas de trabajo",
        route: "/area",
      },
    ],
  },
  {
    name: "PERFIL",
    menuItems: [
      {
        icon: <FaChartPie size={24} />,
        label: "Almacenamiento",
        route: "/almacenamiento",
      },
    ],
  },
];

//area de trabajo --> Archivo divido por grupos
// compartido por mi --> para ver permisos etc
// almacenamiento para ver parte del almacenamiento o mezclar con mi unidad para hacerlo mejor
// menu de recientes todas las subidas recientes que se han hecho
//elemento destacado --> archivos destacados propios facil de hacer ? añadir campo boolean base de datos
