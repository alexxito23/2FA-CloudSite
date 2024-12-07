import { Button, Input } from "@nextui-org/react";
import { CardWrapper } from "./card-wrapper";

export const LoginForm = () => {
  return (
    <CardWrapper
      headerLabel="Welcome Back"
      backButtonLabel="No tienes Cuenta"
      backButtonHref="/auth/register"
      showSocial
    >
      <form className="flex gap-4 flex-col" action="">
        <Input type="email" label="Email" />
        <Input type="pass" label="Password" />
        <Button type="submit">Login</Button>
      </form>
    </CardWrapper>
  );
};
