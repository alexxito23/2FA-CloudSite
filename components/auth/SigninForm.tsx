"use client";
import type React from "react";
import { useState } from "react";
import { Button, Link } from "@nextui-org/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import { handleLogin, validateLogin } from "../../utils/auth";
import { validatePassword } from "../../utils/passwordValidation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SigninFormProps {
  onQrTokenChange: (token: string) => void;
  appStatus: "idle" | "error" | "loading" | "validate" | "pass";
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void;
  setExpiration: (timestamp: number) => void;
}

export default function SigninForm({
  onQrTokenChange,
  appStatus,
  setAppStatus,
  setExpiration,
}: SigninFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    try {
      setAppStatus("loading");
      const { token, expiration } = await handleLogin(formData);
      setExpiration(expiration);
      onQrTokenChange(token);
      setAppStatus("validate");

      setTimeout(() => validateLogin(token, router, setAppStatus), 1000);
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
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
        icon="email"
      />
      <PasswordInput
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        disabled={appStatus === "loading" || appStatus === "validate"}
      />
      <div className="mb-6 flex items-center justify-between gap-2 py-2">
        <Link isBlock showAnchorIcon color="primary" href="/auth/pass">
          Te has olvidado de la contraseña?
        </Link>
      </div>
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
              : "Inicia Sesión"}
        </Button>
      </div>
    </form>
  );
}
