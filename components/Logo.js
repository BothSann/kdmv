import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <div className="relative w-26 aspect-video ">
        <Image
          src="/logo.png"
          alt="logo"
          sizes="100vw"
          fill
          className="object-contain dark:invert"
        />
      </div>
    </Link>
  );
}
