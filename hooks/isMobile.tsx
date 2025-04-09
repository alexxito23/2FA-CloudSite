import { useState, useEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;

    const mobileDevices = [
      "Android",
      "webOS",
      "iPhone",
      "iPad",
      "iPod",
      "BlackBerry",
      "Windows Phone",
      "Opera Mini",
      "IEMobile",
      "Mobile",
      "Kindle",
      "Silk",
    ];

    const isMobileDevice = mobileDevices.some((device) =>
      userAgent.includes(device),
    );

    setIsMobile(isMobileDevice);
  }, []);

  return isMobile;
};

export default useIsMobile;
