import type React from "react";
import { useState } from "react";
import { Input } from "@nextui-org/react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  disabled,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
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
          tabIndex={-1}
        >
          {isVisible ? (
            <IoMdEyeOff size={26} color={"#9CA3AF"} />
          ) : (
            <IoMdEye size={26} color={"#9CA3AF"} />
          )}
        </button>
      }
      label={label}
      type={isVisible ? "text" : "password"}
      isRequired
      name={name}
      value={value}
      onChange={onChange}
      isDisabled={disabled}
    />
  );
}
