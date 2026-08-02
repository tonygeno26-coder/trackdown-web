import Image from "next/image";

type LogoVariant = "header" | "icon" | "splash";

const VARIANTS: Record<
  LogoVariant,
  { src: string; width: number; height: number; className?: string }
> = {
  header: {
    src: "/logo-header.png",
    width: 592,
    height: 168,
    className: "h-[52px] w-auto max-w-[min(100%,320px)]",
  },
  icon: {
    src: "/logo-icon.png",
    width: 512,
    height: 512,
    className: "h-9 w-9",
  },
  splash: {
    src: "/logo.png",
    width: 640,
    height: 220,
    className: "h-auto w-[min(100%,280px)]",
  },
};

export default function TrackdownLogo({
  variant = "header",
  className = "",
  priority = false,
}: {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}) {
  const config = VARIANTS[variant];
  return (
    <Image
      src={config.src}
      alt="Trackdown"
      width={config.width}
      height={config.height}
      priority={priority}
      className={[config.className, className].filter(Boolean).join(" ")}
    />
  );
}
