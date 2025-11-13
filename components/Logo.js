import Image from "next/image";
import Link from "next/link";

export default function Logo({ width = "w-26", className = "" }) {
  return (
    <Link href="/">
      <div className={`relative aspect-video ${width}`}>
        <Image
          src="/KDMV_LOGO_OG_BLACK.png"
          alt="logo"
          sizes="(max-width: 768px) 200px, 200px"
          fill
          quality={70}
          className={`object-contain dark:invert ${className}`}
          priority
        />
      </div>
    </Link>
  );
}
