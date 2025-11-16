"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function CollectionBanner({ imageUrl, name }) {
  return (
    <motion.div
      className="relative aspect-[16/12] lg:aspect-[16/7] overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          quality={50}
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-20 w-full p-3 lg:p-5">
        <motion.p
          className="text-white/95 font-bold text-xl lg:text-4xl relative inline-block leading-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {name}
        </motion.p>
      </div>
    </motion.div>
  );
}
