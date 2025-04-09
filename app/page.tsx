// pages/home.tsx

"use client";
import Layout from "@/components/auth";
//import QRCodeGenerator from "@/components/QRCodeGenerator";
//import Timer from "@/components/Timer";
import SigninForm from "@/components/auth/SigninForm";
import UserForm from "@/components/auth/UserForm";

export default function Home() {
  return (
    <Layout
      title="Bienvenido de Nuevo!"
      subtitle="Inicia sesión en tu cuenta"
      appStatus="idle"
      qrCode={
        <div className="flex flex-row gap-x-2 font-semibold uppercase text-primary">
          {/*           <QRCodeGenerator token="8844884" text="register" />
          <Timer minutes={0} seconds={0} /> */}
        </div>
      }
    >
      <UserForm title="Inicia Sesión">
        <SigninForm />
      </UserForm>
    </Layout>
  );
}
