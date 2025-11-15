"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CollectionItem({ collection, index = 0 }) {
  return (
    <motion.li
      className="group overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/collections/${collection.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 z-10" />

          <motion.div
            className="relative w-full h-full"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Image
              alt={collection.name}
              src={collection.banner_image_url}
              fill
              loading="lazy"
              quality={50}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top"
            />
          </motion.div>

          {/* Text with underline effect */}
          <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5 z-20">
            <motion.p
              className="text-white font-bold text-base lg:text-2xl relative inline-block leading-tight"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
            >
              {collection.name}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
            </motion.p>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
