import { Link } from "@nextui-org/react";
import React from "react";

interface UserFormProps {
  children: React.ReactNode;
  title: string;
}

export default function UserForm({ children, title }: UserFormProps) {
  return (
    <>
      <div className="my-6 flex items-center justify-center">
        <div className="block h-px w-full bg-dark-3"></div>
        <div className="block w-full min-w-fit bg-gray-dark px-3 text-center font-medium text-dark-6">
          ❌ {title} ❌
        </div>
        <div className="block h-px w-full bg-dark-3"></div>
      </div>

      <div>{children}</div>

      {title === "Inicia Sesión" && (
        <div className="mt-6 text-center text-dark-6">
          <div>
            No tienes cuenta?{" "}
            <Link isBlock showAnchorIcon color="primary" href="/auth/signup">
              Regístrate
            </Link>
          </div>
        </div>
      )}

      {title === "Regístrate" && (
        <div className="mt-6 text-center text-dark-6">
          <div>
            Tienes cuenta?{" "}
            <Link isBlock showAnchorIcon color="primary" href="/">
              Inicia Sesión
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
