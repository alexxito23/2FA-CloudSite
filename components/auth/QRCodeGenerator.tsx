import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

interface QRCodeGeneratorProps {
  children: React.ReactNode;
  token: string;
  text: string;
  width?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  children,
  token,
  text,
  width = 325,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    const url = `token=${token}`;

    const options = {
      type: "image/png" as const,
      color: {
        dark: "#9ca3af",
        light: "#00000000",
      },
      width,
    };

    QRCode.toDataURL(url, options, (err, url) => {
      if (err) {
        console.error("Error generando el QR:", err);
      } else {
        setQrCodeDataUrl(url);
      }
    });
  }, [token, text, width]);

  return token ? (
    <>
      {qrCodeDataUrl && (
        <Image
          src={qrCodeDataUrl}
          alt="Código QR"
          width={width}
          height={width}
        />
      )}
      {children}
    </>
  ) : (
    <div className="flex h-[28rem] items-center justify-center text-xl">
      <h1>¡Error al generar el token!</h1>
    </div>
  );
};

export default QRCodeGenerator;
