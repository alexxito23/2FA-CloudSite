import React, { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@nextui-org/react";

interface SuspenseImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const SuspenseImage: React.FC<SuspenseImageProps> = ({
  src,
  alt,
  width,
  height,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Cuando la imagen se haya cargado, cambiar el estado
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <Skeleton />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoadingComplete={handleImageLoad}
        style={{ display: isLoading ? "none" : "block" }} // Ocultar la imagen mientras se carga
      />
    </>
  );
};

export default SuspenseImage;
