"use client";
import Layout from "@/components/auth";
import QRCodeGenerator from "@/components/auth/QRCodeGenerator";
import { useState } from "react";
import SignupForm from "@/components/auth/SignupForm";
import UserForm from "@/components/auth/UserForm";
import { Button, Link } from "@nextui-org/react";
import Timer from "@/components/auth/Timer";
import { Toaster } from "sonner";

// Definir el objeto de los estados
const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
  VALIDATE: "validate",
} as const;

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

export default function Signup() {
  const [qrToken, setQrToken] = useState<string>("");
  const [expiration, setExpiration] = useState<number>(Date.now());
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const handleQrTokenChange = (token: string) => {
    setQrToken(token);
  };

  const handleAppStatusChange = (status: AppStatusType) => {
    setAppStatus(status);
  };

  const handleExpirationTime = (timestamp: number) => {
    setExpiration(timestamp);
  };

  return (
    <>
      <Toaster expand richColors position="top-right" />
      <Layout
        title="Bienvenido a CloudBlock!"
        subtitle="Regístrate en tu cuenta"
        appStatus={appStatus}
        qrCode={
          <div className="flex flex-col items-center justify-center gap-x-2 font-semibold uppercase text-primary">
            <QRCodeGenerator token={qrToken} text="register">
              <Timer targetTimestamp={expiration} />
            </QRCodeGenerator>
          </div>
        }
        AppButton={
          qrToken ? (
            <div className="flex items-center justify-center gap-4">
              <Button
                className="text-md mb-4 flex h-14 w-full rounded-lg bg-primary bg-opacity-40  font-bold uppercase text-white"
                as={Link}
                href={`cloudblock://open?token=${qrToken}&type=register`}
              >
                Abrir App
              </Button>
              <Timer targetTimestamp={expiration} />
            </div>
          ) : (
            <h1 className="flex items-center justify-center font-bold uppercase text-primary">
              ¡Error al generar el token!
            </h1>
          )
        }
      >
        <UserForm title="Regístrate">
          <SignupForm
            onQrTokenChange={handleQrTokenChange}
            appStatus={appStatus}
            setAppStatus={handleAppStatusChange}
            setExpiration={handleExpirationTime}
          />
        </UserForm>
      </Layout>
    </>
  );
}
