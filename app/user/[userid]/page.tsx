"use client";

import FileContent from "@/components/content";
import Topfiles from "@/components/topfiles";
import { Spinner } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function Dashboard() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [loading, setLoading] = useState(true);
  const [cookie, setCookie] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        const data = await response.json();
        const userCookie = data?.cookie?.value;

        if (!data?.authenticated) {
          router.push("/"); // 🔐 No autenticado
          return;
        }

        if (id !== userCookie) {
          router.push("/404"); // ❌ No coincide el ID
          return;
        }

        setCookie(userCookie);
        setLoading(false);
      } catch (error) {
        console.error("Error de autenticación:", error);
        router.push("/"); // 🔄 Por seguridad redirigimos
      }
    };

    checkAuth();
  }, [id, router]);

  return (
    <>
      <Toaster expand richColors position="top-right" />
      <main className="h-full p-5 dark:bg-dark-2">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Spinner
              color="primary"
              label="Cargando"
              classNames={{
                label: "text-4xl font-bold text-dark dark:text-white pt-12",
                wrapper: "scale-[3]",
              }}
            />
            <p className="text-lg text-dark dark:text-white">
              Puede tardar unos minutos...
            </p>
          </div>
        ) : (
          <>
            <Topfiles />
            {cookie && <FileContent cookie={cookie} directorio="/" />}
          </>
        )}
      </main>
    </>
  );
}
