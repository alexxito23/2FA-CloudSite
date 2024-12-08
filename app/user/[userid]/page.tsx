import { Suspense } from "react";

export default async function Dashboard({
  params,
}: {
  params: { userid: string };
}) {
  const { userid } = await params;
  return (
    <div>
      <Suspense fallback={<div>Cargando</div>}>{userid}</Suspense>
    </div>
  );
}
