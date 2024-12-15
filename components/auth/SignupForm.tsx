"use client";
import React, { useState } from "react";
import { Button } from "@nextui-org/react";
import { MdOutlineEmail, MdDriveFileRenameOutline } from "react-icons/md";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

import { Input } from "@nextui-org/react";

export default function SignupForm() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <form action="">
      <Input
        classNames={{
          inputWrapper:
            "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
          label: "text-md",
          input: "text-md",
          base: "mb-4",
        }}
        variant="bordered"
        endContent={<MdDriveFileRenameOutline size={26} color={"#9CA3AF"} />}
        label="Nombre"
        type="text"
      />

      <Input
        classNames={{
          inputWrapper:
            "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
          label: "text-md",
          input: "text-md",
          base: "mb-4",
        }}
        variant="bordered"
        endContent={<MdDriveFileRenameOutline size={26} color={"#9CA3AF"} />}
        label="Apellidos"
        type="text"
      />

      <Input
        classNames={{
          inputWrapper:
            "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
          label: "text-md",
          input: "text-md",
          base: "mb-4",
        }}
        variant="bordered"
        endContent={<MdOutlineEmail size={26} color={"#9CA3AF"} />}
        label="Email"
        type="email"
      />

      <Input
        classNames={{
          inputWrapper:
            "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
          label: "text-md",
          input: "text-md",
          base: "mb-5",
        }}
        variant="bordered"
        endContent={
          <button
            aria-label="toggle password visibility"
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <IoMdEyeOff size={26} color={"#9CA3AF"} />
            ) : (
              <IoMdEye size={26} color={"#9CA3AF"} />
            )}
          </button>
        }
        label="Contraseña"
        type={isVisible ? "text" : "password"}
      />

      <Input
        classNames={{
          inputWrapper:
            "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
          label: "text-md",
          input: "text-md",
          base: "mb-5",
        }}
        variant="bordered"
        endContent={
          <button
            aria-label="toggle password visibility"
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
          >
            {isVisible ? (
              <IoMdEyeOff size={26} color={"#9CA3AF"} />
            ) : (
              <IoMdEye size={26} color={"#9CA3AF"} />
            )}
          </button>
        }
        label="Repetir Contraseña"
        type={isVisible ? "text" : "password"}
      />

      <div className="mb-4">
        <Button
          type="submit"
          className="text-md flex h-14 w-full rounded-lg bg-primary bg-opacity-50 font-bold uppercase text-white transition hover:bg-opacity-30"
        >
          Regístrate
        </Button>
      </div>
    </form>
  );
}
