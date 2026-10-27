import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

// Intrinsic aspect ratio of the supplied logo artwork (676 x 175), used
// when the uploaded file has no stored dimensions (SVG).
const RATIO = 676 / 175;

// Shipped copies of the supplied logo, used only if none is set in the CMS.
const FALLBACK = { default: "/brand/adpulse-logo.svg", reversed: "/brand/adpulse-logo-reversed.svg" };

type LogoProps = {
  variant?: "default" | "reversed";
  height?: number;
  priority?: boolean;
  className?: string;
};

export async function Logo({
  variant = "default",
  height = 48,
  priority = false,
  className = "",
}: LogoProps) {
  const site = await getSiteSettings();
  const file = variant === "reversed" ? site.logoReversed : site.logo;
  const ratio = file?.width && file.height ? file.width / file.height : RATIO;
  return (
    <Link href="/" aria-label={`${site.name} home`} className={className}>
      <Image
        src={file?.url ?? FALLBACK[variant]}
        alt={file?.alt ?? site.name}
        width={Math.round(height * ratio)}
        height={height}
        priority={priority}
        unoptimized={!file || file.mimeType === "image/svg+xml"}
      />
    </Link>
  );
}
