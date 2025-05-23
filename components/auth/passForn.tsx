"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import FormInput from "./FormInput";
import { handleChange, handlePass, validateEmail } from "../../utils/auth";
import { validatePassword } from "../../utils/passwordValidation";
import PasswordInput from "./PasswordInput";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface PassFormProps {
  onQrTokenChange: (token: string) => void;
  appStatus: "idle" | "error" | "loading" | "validate" | "pass";
  setAppStatus: (
    status: "idle" | "error" | "loading" | "validate" | "pass",
  ) => void;
  setExpiration: (timestamp: number) => void;
}

export default function PassForm({
  onQrTokenChange,
  appStatus,
  setAppStatus,
  setExpiration,
}: PassFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [token, setToken] = useState<string>("");
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
    try {
      if (appStatus !== "pass") {
        setAppStatus("loading");
        const { token, expiration } = await handlePass(formData);
        setExpiration(expiration);
        setToken(token);
        onQrTokenChange(token);
        setAppStatus("validate");

        setTimeout(() => validateEmail(token, setAppStatus), 1000);
      } else {
        const errors = validatePassword(formData.password);
        if (errors.length > 0) {
          errors.forEach((error) => toast.error(error));
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          return;
        }

        setAppStatus("loading");
        await handleChange(formData, router, token);
        setAppStatus("pass");
      }
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
        minLength={1}
        maxLength={40}
        pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
      />
      {appStatus === "error" ||
        (appStatus === "pass" && (
          <>
            <PasswordInput
              label="Contraseña"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={appStatus !== "pass" && appStatus !== "error"}
            />
            {passwordErrors.length > 0 && (
              <ul className="mb-2 mt-1 text-sm text-red-500">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            <PasswordInput
              label="Repetir Contraseña"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={appStatus !== "pass" && appStatus !== "error"}
            />
          </>
        ))}
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
              : "Recupera"}
        </Button>
      </div>
    </form>
  );
}
