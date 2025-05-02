"use client";
import type React from "react";
import { useEffect, useState } from "react";
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

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000; // 5 minutos en milisegundos

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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const router: AppRouterInstance = useRouter();

  // Efecto para el contador de bloqueo
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBlocked && blockTime > 0) {
      interval = setInterval(() => {
        setBlockTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBlocked, blockTime]);

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

    if (isBlocked) {
      toast.error(
        `Cuenta bloqueada temporalmente. Espere ${blockTime} segundos.`,
      );
      return;
    }

    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    try {
      setAppStatus("loading");
      const { token, expiration } = await handleLogin(formData);

      // Resetear intentos si el login es exitoso
      setLoginAttempts(0);
      setExpiration(expiration);
      onQrTokenChange(token);
      setAppStatus("validate");

      setTimeout(() => validateLogin(token, router, setAppStatus), 1000);
    } catch (error) {
      setAppStatus("error");

      // Incrementar intentos fallidos
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        // Bloquear después de MAX_ATTEMPTS intentos fallidos
        setIsBlocked(true);
        setBlockTime(Math.floor(BLOCK_TIME / 1000)); // Convertir a segundos

        toast.warning(
          `Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.`,
        );
      } else {
        toast.error(
          error instanceof Error
            ? `${error.message} (Intentos restantes: ${MAX_ATTEMPTS - newAttempts})`
            : `Error al enviar el formulario (Intentos restantes: ${MAX_ATTEMPTS - newAttempts})`,
        );
      }
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
        disabled={
          appStatus === "loading" || appStatus === "validate" || isBlocked
        }
        icon="email"
      />
      <PasswordInput
        label="Contraseña"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        disabled={
          appStatus === "loading" || appStatus === "validate" || isBlocked
        }
      />

      {isBlocked && (
        <div className="mb-2 text-sm text-red-600">
          Cuenta bloqueada. Tiempo restante: {blockTime} segundos
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-2 py-2">
        <Link isBlock showAnchorIcon color="primary" href="/auth/pass">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <div className="mb-4">
        <Button
          type="submit"
          className="text-md flex h-14 w-full rounded-lg bg-primary bg-opacity-50 font-bold uppercase text-white transition hover:bg-opacity-30"
          isDisabled={
            appStatus === "loading" ||
            appStatus === "validate" ||
            passwordErrors.length > 0 ||
            isBlocked
          }
        >
          {appStatus === "loading"
            ? "Enviando..."
            : appStatus === "validate"
              ? "Enviado"
              : isBlocked
                ? "Cuenta Bloqueada"
                : "Iniciar Sesión"}
        </Button>
      </div>
    </form>
  );
}
