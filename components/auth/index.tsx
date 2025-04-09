import React, { ReactNode, useState, useCallback } from "react";
import Image from "next/image";
import { Skeleton } from "@nextui-org/react";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  appStatus: "idle" | "error" | "loading" | "validate";
  qrCode?: JSX.Element;
  AppButton?: JSX.Element;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  appStatus,
  qrCode,
  AppButton,
}) => {
  const [loading, setLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <main className="flex items-center bg-dark-2">
      <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="h-[60rem] rounded-[10px] bg-gray-dark xl:h-[50rem]">
          <div className="flex flex-wrap items-center">
            <div className="w-full xl:w-1/2">
              <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-4 xl:hidden">
                <Skeleton
                  isLoaded={!loading}
                  className="h-[36px] w-[200px] rounded-lg dark:bg-gray-dark dark:before:bg-gradient-to-r dark:before:from-transparent dark:before:via-dark-2"
                >
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={200}
                    height={35}
                    onLoad={handleImageLoad}
                    loading="lazy"
                  />
                </Skeleton>
                <div className="mt-4 flex flex-col items-center justify-center">
                  <h1 className="sm:text-heading-3 mb-4 text-2xl font-bold text-white">
                    🔐 {title}
                  </h1>
                  <p className="w-full max-w-[375px] font-medium text-dark-6">
                    Inicie sesión en su cuenta completando los campos necesarios
                    a continuación
                  </p>
                </div>
              </div>
              <div className="xl:p-15 h-full w-full p-7">{children}</div>
            </div>

            <div className="hidden h-[50rem] w-full p-7 xl:block xl:w-1/2">
              <div className="h-full overflow-hidden rounded-2xl !bg-dark-2 bg-none px-12 pt-12">
                <div className="mb-10 inline-block">
                  <Skeleton
                    isLoaded={!loading}
                    className="h-[36px] w-[200px] rounded-lg dark:bg-gray-dark dark:before:bg-gradient-to-r dark:before:from-transparent dark:before:via-dark-2"
                  >
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={200}
                      height={159}
                      onLoad={handleImageLoad}
                      loading="lazy"
                    />
                  </Skeleton>
                </div>
                <p className="mb-3 text-xl font-medium text-white">
                  {subtitle}
                </p>
                <h1 className="sm:text-heading-3 mb-4 text-2xl font-bold text-white">
                  🔐 {title}
                </h1>
                <p className="w-full max-w-[375px] font-medium text-dark-6">
                  Inicie sesión en su cuenta completando los campos necesarios a
                  continuación
                </p>

                {appStatus === "validate" && qrCode}

                {appStatus === "idle" && (
                  <div className="flex h-[28rem] items-center justify-center">
                    <Skeleton
                      isLoaded={!loading}
                      className="h-[323px] w-[405px] rounded-lg dark:bg-gray-dark dark:before:bg-gradient-to-r dark:before:from-transparent dark:before:via-dark-2"
                    >
                      <Image
                        src={"/images/grid.svg"}
                        alt="Logo"
                        width={405}
                        height={325}
                        className="mx-auto dark:opacity-30"
                        onLoad={handleImageLoad}
                        loading="lazy"
                      />
                    </Skeleton>
                  </div>
                )}
              </div>
            </div>
            <div className="block w-full p-7 xl:hidden">
              <div className="flex flex-col items-center justify-center">
                {appStatus === "validate" && AppButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
