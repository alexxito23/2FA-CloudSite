"use client";
import Layout from "@/components/auth";
import QRCodeGenerator from "@/components/auth/QRCodeGenerator";
import { useEffect, useState } from "react";
import UserForm from "@/components/auth/UserForm";
import { Spinner } from "@nextui-org/react";
import Timer from "@/components/auth/Timer";
import { Toaster } from "sonner";
import SigninForm from "@/components/auth/SigninForm";
import { useRouter } from "next/navigation";

// Definir el objeto de los estados
const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  LOADING: "loading",
  VALIDATE: "validate",
  PASS: "pass",
} as const;

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

export default function Signup() {
  const [qrToken, setQrToken] = useState<string>("");
  const [expiration, setExpiration] = useState<number>(Date.now());
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleQrTokenChange = (token: string) => {
    setQrToken(token);
  };

  const handleAppStatusChange = (status: AppStatusType) => {
    setAppStatus(status);
  };

  const handleExpirationTime = (timestamp: number) => {
    setExpiration(timestamp);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.authenticated) {
        setLoading(true);
        const userCookie = data.cookie.value;
        router.push(`user/${userCookie}`); // Redirigir si no está autenticado
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      {loading ? (
        <main className="flex items-center bg-dark-2">
          <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="h-[60rem] rounded-[10px] bg-gray-dark xl:h-[50rem]">
              <div className="flex h-full flex-col flex-wrap items-center justify-center gap-4">
                <Spinner
                  color="primary"
                  label="Iniciando Sesión"
                  classNames={{
                    label: "text-4xl font-bold text-white pt-12",
                    wrapper: "scale-[3]",
                  }}
                />
                <p className="text-lg text-white">Puede tardar unos minutos</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <Toaster expand richColors position="top-right" />
          <Layout
            title="Bienvenido de Nuevo!"
            subtitle="Inicia sesión en tu cuenta"
            appStatus={appStatus}
            qrCode={
              <div className="flex flex-col items-center justify-center gap-x-2 font-semibold uppercase text-primary">
                <QRCodeGenerator token={qrToken} text="register">
                  <Timer targetTimestamp={expiration} />
                </QRCodeGenerator>
              </div>
            }
          >
            <UserForm title="Inicia Sesión">
              <SigninForm
                onQrTokenChange={handleQrTokenChange}
                appStatus={appStatus}
                setAppStatus={handleAppStatusChange}
                setExpiration={handleExpirationTime}
              />
            </UserForm>
          </Layout>
        </>
      )}
    </>
  );
}
