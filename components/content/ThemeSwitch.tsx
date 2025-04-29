"use client";

import { useSwitch, VisuallyHidden } from "@nextui-org/react";
import { MdOutlineStar, MdOutlineStarBorder } from "react-icons/md";
import { useEffect, useState } from "react";

type SwitchProps = {
  fileName: string;
  directory: string;
  seleccionado?: boolean;
};

const ThemeSwitch = ({
  fileName,
  directory,
  seleccionado = false,
}: SwitchProps) => {
  const [selected, setSelected] = useState(seleccionado);

  // Sincroniza el estado interno con la prop `seleccionado`
  useEffect(() => {
    setSelected(seleccionado);
  }, [seleccionado]);

  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } =
    useSwitch({ isSelected: selected, onChange: () => {} });

  const handleToggle = async () => {
    const nuevoValor = !selected;
    setSelected(nuevoValor); // optimistic UI

    try {
      const res = await fetch("/api/user/favorite-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nombre: fileName,
          directorio: directory,
          seleccionado: nuevoValor,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar favorito");

      const data = await res.json();
      console.log("Respuesta:", data);
    } catch (error) {
      console.error("Error:", error);
      setSelected(!nuevoValor); // revertir si falla
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Component {...getBaseProps()} onClick={handleToggle}>
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: [
              "h-9 w-9",
              "flex items-center justify-center",
              "rounded-lg bg-default-100 hover:bg-default-200",
            ],
          })}
        >
          {selected ? (
            <MdOutlineStar size={24} />
          ) : (
            <MdOutlineStarBorder size={24} />
          )}
        </div>
      </Component>
    </div>
  );
};

export default ThemeSwitch;
