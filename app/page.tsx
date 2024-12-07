"use client";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const onClick = () => {
    router.push("/auth/login");
  };

  return (
    <main className="flex h-full flex-col items-center justify-center bg-sky-950">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold text-white drop-shadow-md">
          🔐Auth
        </h1>
        <p className="text-white text-lg">A simple authentication service</p>
        <div>
          <Button onClick={onClick} color="primary" variant="flat">
            Login
          </Button>
        </div>
      </div>
    </main>
  );
}
