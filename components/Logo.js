import Image from "next/image";
import Link from "next/link";

export default function Logo({ width = "w-26", className = "" }) {
  return (
    <Link href="/">
      <div className={`relative aspect-video ${width}`}>
        <Image
          src="/KDMV_LOGO_OG_BLACK.png"
          alt="logo"
          sizes="100vw"
          fill
          quality={100}
          loading="lazy"
          className={`object-contain dark:invert ${className}`}
        />
      </div>
    </Link>
  );
}
