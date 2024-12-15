import UserForm from "@/components/auth";
import SignupForm from "@/components/auth/SignupForm";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regístrate en CloudBlock",
  description: "Regístrate en CloudBlock para la máxima seguridad en el cloud",
};

export default function Signup() {
  return (
    <main className="flex w-full items-center bg-dark-2">
      <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="shadow-1 shadow-card h-[50rem] rounded-[10px] bg-gray-dark">
          <div className="flex flex-wrap items-center">
            <div className=" w-full xl:w-1/2">
              <div className="xl:p-15 h-full w-full p-7">
                <UserForm title="Regístrate">
                  <SignupForm />
                </UserForm>
              </div>
            </div>

            <div className="hidden h-[50rem] w-full p-7 xl:block xl:w-1/2">
              <div className="custom-gradient-1 h-full overflow-hidden rounded-2xl !bg-dark-2 bg-none px-12 pt-12">
                <Link className="mb-10 inline-block" href="/">
                  <Image
                    src={"/images/logo.png"}
                    alt="Logo"
                    width={200}
                    height={159}
                  />
                </Link>
                <p className="mb-3 text-xl font-medium text-white">
                  Regístrate en tu cuenta
                </p>

                <h1 className="sm:text-heading-3 mb-4 text-2xl font-bold text-white">
                  🔐Bienvenido a <i>CloudBlock!</i>
                </h1>

                <p className="w-full max-w-[375px] font-medium text-dark-6">
                  Crea una cuenta completando los campos necesarios a
                  continuación
                </p>

                <div className="mt-32">
                  <Image
                    src={"/images/grid.svg"}
                    alt="Logo"
                    width={405}
                    height={325}
                    className="mx-auto dark:opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
