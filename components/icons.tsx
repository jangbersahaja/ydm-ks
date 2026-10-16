import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Svg({
  className = "h-5 w-5",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </Svg>
  );
}

export function BarcodeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14" />
    </Svg>
  );
}

export function QrCodeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h.01" />
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5M9.5 20v-5h5v5" />
    </Svg>
  );
}

export function ListCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M3.5 6l1.5 1.5L7 5.5M3.5 12l1.5 1.5L7 11.5M3.5 18l1.5 1.5L7 17.5" />
    </Svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" />
      <path d="M12 7H8.5a2.5 2.5 0 1 1 2.5-2.5C11 6 12 7 12 7zM12 7h3.5A2.5 2.5 0 1 0 13 4.5C13 6 12 7 12 7z" />
    </Svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5" />
      <path d="M4 4v4.5h4.5M12 8v4l2.5 1.5" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
    </Svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </Svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </Svg>
  );
}

export function DrinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 8h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M16 10h1.5a2 2 0 0 1 0 4H16" />
      <path d="M4 21h13" />
    </Svg>
  );
}

export function PercentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 6L6 18" />
      <circle cx="7.5" cy="7.5" r="2" />
      <circle cx="16.5" cy="16.5" r="2" />
    </Svg>
  );
}

export function BanknoteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  );
}

export function VoucherKindIcon({
  kind,
  className,
}: IconProps & { kind: string }) {
  if (kind === "percent_off") return <PercentIcon className={className} />;
  if (kind === "amount_off") return <BanknoteIcon className={className} />;
  return <DrinkIcon className={className} />;
}
