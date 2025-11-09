import Image from "next/image";
import Link from "next/link";

export default function CollectionItem({ collection }) {
  return (
    <li className="group overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      <Link href={`/collections/${collection.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 z-10" />

          <Image
            alt={collection.name}
            src={collection.banner_image_url}
            fill
            loading="lazy"
            quality={50}
            className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
          />

          {/* Text with underline effect */}
          <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5 z-20">
            <p className="text-white font-bold text-base lg:text-2xl relative inline-block leading-tight">
              {collection.name}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
