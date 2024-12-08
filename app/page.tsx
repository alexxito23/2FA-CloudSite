import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-sky-950">
      <LoginForm />
    </main>
  );
}
