"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Link,
} from "@nextui-org/react";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className="max-w-[400px] w-1/5 bg-white">
      <CardHeader className="flex gap-3">
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
          <h1 className="text-3xl font-semibold">🔐Auth</h1>
          {headerLabel}
        </div>
      </CardHeader>
      <Divider className="bg-black" />
      <CardBody>{children}</CardBody>
      <Divider className="bg-black" />
      {showSocial && (
        <CardFooter>
          <div className="flex items-center w-full gap-x-2">
            <Button className="w-full">Google</Button>
            <Button className="w-full">Github</Button>
          </div>
        </CardFooter>
      )}
      <CardFooter className="flex items-center justify-center w-full">
        <Link href={backButtonHref}>{backButtonLabel}</Link>
      </CardFooter>
    </Card>
  );
};
