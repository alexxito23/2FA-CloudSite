import type React from "react";
import { Input } from "@nextui-org/react";
import { MdOutlineEmail, MdDriveFileRenameOutline } from "react-icons/md";

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  type?: string;
  icon: "email" | "name";
  minLength: number;
  maxLength: number;
  pattern?: string;
}

export default function FormInput({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  icon,
  minLength,
  maxLength,
  pattern,
}: FormInputProps) {
  const IconComponent =
    icon === "email" ? MdOutlineEmail : MdDriveFileRenameOutline;

  return (
    <Input
      classNames={{
        inputWrapper:
          "rounded-lg border border-dark-3 bg-dark-2 font-medium text-white group-data-[focus=true]:border-[#50f1d9] focus-visible:shadow-none text-md pl-4",
        label: "text-md",
        input: "text-md",
        base: "mb-4",
      }}
      variant="bordered"
      endContent={<IconComponent size={26} color={"#9CA3AF"} />}
      label={label}
      type={type}
      isRequired
      name={name}
      value={value}
      onChange={onChange}
      isDisabled={disabled}
      minLength={minLength}
      maxLength={maxLength}
      pattern={pattern}
    />
  );
}
