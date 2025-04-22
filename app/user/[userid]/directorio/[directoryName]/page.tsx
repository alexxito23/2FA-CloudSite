"use client";
import FileContent from "@/components/content";
import { Spinner } from "@nextui-org/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function DirectoryContent() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract the cookie value from the URL path
  const cookieId = pathname.split("/")[2]; // Assuming /user/[cookieId]/[directoryName]
  const directoryName = pathname.split("/")[4]; // Assuming /user/[cookieId]/[directoryName]
  const [loading, setLoading] = useState(true);
  const [cookie, setCookie] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        const data = await response.json();
        const userCookie = data?.cookie?.value;

        // If user is not authenticated, redirect to home page
        if (!data?.authenticated) {
          router.push("/"); // 🔐 Not authenticated
          return;
        }

        // If the cookie ID does not match, redirect to 404 page
        if (cookieId !== userCookie) {
          router.push("/404"); // ❌ Cookie ID does not match
          return;
        }
        setCookie(userCookie);
        setLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/"); // 🔄 Redirect on error
      }
    };

    checkAuth();
  }, [cookieId, router, cookie]);
  console.log(decodeURIComponent(directoryName));
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
            {cookie && (
              <FileContent
                cookie={cookie}
                directorio={decodeURIComponent(directoryName)}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
