"use client";

import { CameraIcon, CloseIcon } from "@/components/icons";
import { iconButtonClass, inputClass, labelClass } from "@/components/ui";
import type { Html5Qrcode } from "html5-qrcode";
import { useEffect, useId, useState } from "react";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  scanLabel: string;
  stopLabel: string;
  hint: string;
  errorLabel: string;
  insecureLabel: string;
};

// Camera access is only exposed on https or localhost.
function canUseCamera() {
  return window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
}

async function stopScanner(scanner: Html5Qrcode) {
  try {
    if (scanner.isScanning) await scanner.stop();
  } catch {
    // Already stopped.
  }
  try {
    scanner.clear();
  } catch {
    // Region already removed.
  }
}

// Text input that can be filled by scanning a member QR code with the camera.
// The camera library is loaded only when staff open the scanner.
export function QrScannerInput({
  name,
  label,
  placeholder,
  scanLabel,
  stopLabel,
  hint,
  errorLabel,
  insecureLabel,
}: Props) {
  const [value, setValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const regionId = `qr-reader-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // Preload so the camera starts within the tap gesture on mobile.
  useEffect(() => {
    void import("html5-qrcode");
  }, []);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    const fail = (reason: unknown) => {
      console.error("QR scanner failed to start", reason);
      if (cancelled) return;
      setError(errorLabel);
      setScanning(false);
    };

    (async () => {
      try {
        // Camera APIs are only exposed in secure contexts (HTTPS or localhost).
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("getUserMedia unavailable (insecure context?)");
        }
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        scanner = new Html5Qrcode(regionId);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decodedText) => {
            setValue(decodedText.trim());
            setScanning(false);
          },
          () => {},
        );
        // Stopped while the camera was starting.
        if (cancelled) await stopScanner(scanner);
      } catch (reason) {
        fail(reason);
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) void stopScanner(scanner);
    };
  }, [scanning, regionId, errorLabel]);

  return (
    <div className="block space-y-1.5">
      <span className={labelClass}>{label}</span>
      <div className="flex gap-2">
        <input
          name={name}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => {
            setError(null);
            if (!scanning && !canUseCamera()) {
              setError(insecureLabel);
              return;
            }
            setScanning((on) => !on);
          }}
          aria-label={scanning ? stopLabel : scanLabel}
          title={scanning ? stopLabel : scanLabel}
          className={iconButtonClass("secondary", "self-center")}
        >
          {scanning ? <CloseIcon /> : <CameraIcon />}
        </button>
      </div>
      {scanning ? (
        <div className="space-y-2">
          <div id={regionId} className="overflow-hidden rounded-xl bg-black" />
          <p className="text-xs text-espresso/55">{hint}</p>
        </div>
      ) : null}
      {error ? <p className="text-xs text-accent">{error}</p> : null}
    </div>
  );
}
