"use client";
import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Clock, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import MiniSpinner from "./MiniSpinner";

export default function BakongKHQRModal({
  isOpen,
  onClose,
  qrString,
  amount,
  merchantName,
  expiresAt,
}) {
  const [options, setOptions] = useState({
    width: 300,
    height: 300,
    type: "svg",
    data: qrString,
    image: "/Dollar.png",
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "H",
    },
    imageOptions: {
      hideBackgroundDots: false,
      imageSize: 0.5,
      margin: 20,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    dotsOptions: {
      type: "square",
      color: "#000",
    },
    backgroundOptions: {
      color: "#0000",
    },
    cornersSquareOptions: {
      type: "square",
    },
  });
  const [qrCode, setQrCode] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const ref = useRef(null);
  const modalRef = useRef(null);

  // COUNTDOWN TIMER LOGIC
  useEffect(() => {
    if (!expiresAt || !isOpen) return;

    // Calculate initial time remaining
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        return null;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { minutes, seconds, totalSeconds: Math.floor(difference / 1000) };
    };

    // Initial calculation
    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isOpen]);

  // Format time as MM:SS
  const formatTime = () => {
    if (!timeRemaining) return "00:00";
    const { minutes, seconds } = timeRemaining;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update QR when qrString changes
  useEffect(() => {
    if (qrString) {
      setOptions((prev) => ({ ...prev, data: qrString }));
    }
  }, [qrString]);

  useEffect(() => {
    if (isOpen && ref.current) {
      const instance = new QRCodeStyling(options);
      setQrCode(instance);
      instance.append(ref.current);
    }
  }, [isOpen, options]);

  useEffect(() => {
    if (qrCode && isOpen) {
      qrCode.update(options);
    }
  }, [qrCode, options, isOpen]);

  // Close modal when clicking outside the content
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 animate-in fade-in-0"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-primary-foreground rounded-lg border shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              className="absolute top-0 right-0 z-10"
            >
              <XIcon />
            </Button>

            {/* Countdown Timer - Top Center */}
            {expiresAt && (
              <div className="absolute left-1/2 -translate-x-[60%] bottom-7 border-none bg-background dark:bg-card border shadow-sm rounded-full px-6 py-2 hidden lg:block">
                <div className="flex items-center gap-2 dark:text-foreground/90 text-foreground/90">
                  <Clock size={16} />
                  <span className={`lg:text-base text-sm`}>
                    {isExpired ? "Expired" : formatTime()}
                  </span>
                </div>
              </div>
            )}

            <p className="absolute right-8 bottom-8 text-muted-foreground tracking-wide hidden lg:block">
              KHQR | Scan, Pay, Done
            </p>

            {/* Content - Stack vertically on mobile, horizontal on larger screens */}
            <div className="flex flex-col lg:flex-row items-start gap-14 p-6 py-8">
              {/* QR Code Section */}
              <div className="w-full lg:w-auto mx-auto lg:mx-0 relative">
                <div className="border border-border dark:border-none rounded-lg max-w-[22rem] mx-auto pb-4 dark:bg-white">
                  {/* Logo */}
                  <div className="bg-[#E1232E] rounded-t-lg h-14 flex items-center justify-center">
                    <div className="relative w-16 h-16">
                      <Image
                        src="/KHQR-logo-nobg.png"
                        alt="KHQR Logo"
                        fill
                        sizes="64px"
                        quality={50}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Name and Amount */}
                  <div className="space-y-1.5 px-6 sm:px-10 pt-6 pb-0 relative bg-background dark:bg-white dark:text-primary-foreground">
                    <p className="uppercase font-nunito-sans font-semibold text-sm">
                      {merchantName}
                    </p>
                    <p className="font-nunito-sans text-sm font-semibold ">
                      <span className="text-2xl font-extrabold">
                        {formatCurrency(amount)}{" "}
                      </span>
                      USD
                    </p>
                    <div className="absolute -bottom-4 left-0 right-0 border-b-2 border-border dark:border-muted/40 border-dashed"></div>
                  </div>

                  <div
                    ref={ref}
                    className="flex items-center justify-center bg-background dark:bg-white"
                  />

                  {/* Expired Overlay */}
                  {isExpired && (
                    <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <XIcon className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-lg font-bold">QR Code Expired</p>
                        <p className="text-sm">Please create a new order</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Waiting for payment */}
                <div className="flex items-center justify-center gap-2 absolute bottom-4 left-0 right-0 text-xs">
                  <MiniSpinner />
                  <span className="dark:text-primary-foreground font-medium">
                    Waiting for payment ({isExpired ? "Expired" : formatTime()})
                  </span>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="font-poppins space-y-8 w-full lg:w-auto lg:flex-1 py-4 hidden lg:block">
                <h2 className="text-[1.8rem] font-bold">
                  How to make payment?
                </h2>

                <div className="space-y-4 text-base">
                  <ul className="list-decimal list-inside space-y-1">
                    <li>Open Bakong App</li>
                    <li>Tap &quot;QR PAY&quot;</li>
                    <li>Scan</li>
                    <li>Confirm and Done</li>
                  </ul>

                  {/* Container for "or" with borders */}
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <p className="text-center text-muted-foreground px-4">or</p>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <ul className="list-decimal list-inside space-y-1">
                    <li>Open any Mobile Banking App that support KHQR</li>
                    <li>Scan QR Code</li>
                    <li>Confirm and Done</li>
                  </ul>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-8">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(timeRemaining?.totalSeconds / 180) * 100}%`, // 10 min = 600s
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
