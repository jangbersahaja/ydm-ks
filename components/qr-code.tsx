import Image from "next/image";
import QRCode from "qrcode";

export async function QrCode({
  value,
  size = 220,
  className = "rounded-xl bg-white p-2",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const dataUrl = await QRCode.toDataURL(value, { margin: 1, width: size });
  return (
    <Image
      src={dataUrl}
      alt={`QR ${value}`}
      width={size}
      height={size}
      unoptimized
      className={className}
    />
  );
}
