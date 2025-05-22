"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import { handleRegistration, validateToken } from "../../utils/auth";
import { validatePassword } from "../../utils/passwordValidation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SignupFormProps {
  onQrTokenChange: (token: string) => void;
  appStatus: "idle" | "error" | "loading" | "validate" | "pass";
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void;
  setExpiration: (timestamp: number) => void;
}

export default function SignupForm({
  onQrTokenChange,
  appStatus,
  setAppStatus,
  setExpiration,
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const router: AppRouterInstance = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setAppStatus("loading");
      const { token, expiration } = await handleRegistration(formData);
      setExpiration(expiration);
      onQrTokenChange(token);
      setAppStatus("validate");

      setTimeout(() => validateToken(token, router, setAppStatus), 1000);
    } catch (error) {
      setAppStatus("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al enviar el formulario",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Nombre"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        icon="name"
        minLength={1}
        maxLength={40}
      />
      <FormInput
        label="Apellidos"
        name="lastname"
        value={formData.lastname}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        icon="name"
        minLength={1}
        maxLength={40}
      />
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        icon="email"
        minLength={1}
        maxLength={40}
        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
      />
      <PasswordInput
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        errorMessage={
          passwordErrors.length > 0 && (
            <ul>
              {passwordErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          )
        }
        isInvalid={passwordErrors.length > 0}
      />
      <PasswordInput
        label="Repetir Contraseña"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        isInvalid={passwordErrors.length > 0}
      />
      <div className="mb-4">
        <Button
          type="submit"
          className="text-md flex h-14 w-full rounded-lg bg-primary bg-opacity-50 font-bold uppercase text-white transition hover:bg-opacity-30"
          isDisabled={
            appStatus === "loading" ||
            appStatus === "validate" ||
            passwordErrors.length > 0
          }
        >
          {appStatus === "loading"
            ? "Enviando..."
            : appStatus === "validate"
              ? "Enviado"
              : "Regístrate"}
        </Button>
      </div>
    </form>
  );
}
