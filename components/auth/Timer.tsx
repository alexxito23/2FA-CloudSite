import React, { useState, useEffect } from "react";

interface TimerProps {
  targetTimestamp: number; // Timestamp en segundos
}

const Timer: React.FC<TimerProps> = ({ targetTimestamp }) => {
  // Convertir targetTimestamp a milisegundos
  const targetTimestampInMilliseconds = targetTimestamp * 1000;

  const [timeLeft, setTimeLeft] = useState<number>(
    targetTimestampInMilliseconds - Date.now(),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const remainingTime = targetTimestampInMilliseconds - Date.now();
      if (remainingTime <= 0) {
        clearInterval(intervalId);
        setTimeLeft(0); // Asegurarse de que el tiempo no pase a negativo
      } else {
        setTimeLeft(remainingTime);
      }
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(intervalId); // Limpiar el intervalo cuando el componente se desmonta
  }, [targetTimestampInMilliseconds]);

  // Convierte el tiempo restante en minutos y segundos
  const minutes = Math.floor(timeLeft / 60000); // 60000 ms = 1 minuto
  const seconds = Math.floor((timeLeft % 60000) / 1000); // 1000 ms = 1 segundo

  return (
    <div className="flex flex-row gap-x-2 font-semibold uppercase text-primary">
      <div className="flex w-16 flex-col items-center justify-center gap-y-2">
        <span className="text-4xl tabular-nums">
          {String(minutes).padStart(2, "0")}
        </span>
        <span className="text-center text-xs">Minutos</span>
      </div>
      <div className="flex w-16 flex-col items-center justify-center gap-y-2">
        <span className="text-4xl tabular-nums">
          {String(seconds).padStart(2, "0")}
        </span>
        <span className="text-center text-xs">Segundos</span>
      </div>
    </div>
  );
};

export default Timer;
