import { FaFileAlt } from "react-icons/fa";

interface FileCard {
  content: ContentProps;
}

interface ContentProps {
  nombre: string;
  tamaño: number; // En bytes
  fecha: string;
  ruta: string;
}

// Función para convertir tamaño en bytes a un formato legible (KB, MB, GB)
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

const Topfilesitem = ({ content }: FileCard) => {
  return (
    <div className="box-border flex h-auto items-center justify-center overflow-hidden rounded-large p-6 text-foreground shadow-medium shadow-dark-4 outline-none transition-transform-background data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-focus motion-reduce:transition-none dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center gap-2">
        <FaFileAlt className="fill-current dark:fill-[#e5e7eb]" size={30} />
        <span className="font-semibold dark:text-white">
          {formatSize(content.tamaño)}
        </span>
      </div>
      <div className="flex h-full flex-1 flex-col items-start overflow-hidden px-4">
        <h4 className="w-full truncate overflow-ellipsis whitespace-nowrap text-large font-bold dark:text-white">
          {content.nombre}
        </h4>
        <small className="text-default-500">{content.ruta}</small>
        <small className="mt-1 truncate overflow-ellipsis whitespace-nowrap text-xs text-default-400">
          {content.fecha}
        </small>
      </div>
    </div>
  );
};

export default Topfilesitem;
