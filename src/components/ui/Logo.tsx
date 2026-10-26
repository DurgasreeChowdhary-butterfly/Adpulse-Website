import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content";

// Intrinsic aspect ratio of the supplied logo artwork (676 x 175).
const RATIO = 676 / 175;

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
  const { logo, name } = await getSiteSettings();
  return (
    <Link href="/" aria-label={`${name} home`} className={className}>
      <Image
        src={logo[variant]}
        alt={logo.alt}
        width={Math.round(height * RATIO)}
        height={height}
        priority={priority}
      />
    </Link>
  );
}
