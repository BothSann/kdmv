"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css/bundle";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const slides = [
  // {
  //   id: "1",
  //   image: "/carousel4.jpg",
  //   title: "Childhood Nostalgia",
  //   subtitle: "Hoodies back for good!",
  //   link: "/collections/new-products",
  //   linkText: "Shop Childhood Nostalgia",
  // },
  // {
  //   id: "2",
  //   image: "/carousel5.jpg",
  //   title: "Tourist Vs Purist 2.0",
  //   subtitle: "",
  //   link: "/collections/off-the-pier",
  //   linkText: "Grab One Now",
  // },
  // {
  //   id: "3",
  //   image: "/carousel6.jpg",
  //   title: "KDMV x TENA",
  //   subtitle: "Limited Edition Collection",
  //   // link: "/collections/straight-edge-collection",
  //   linkText: "Shop",
  // },
  // {
  //   id: "4",
  //   image: "/carousel7.jpg",
  //   title: "KDMV Presents: The Revenge",
  //   subtitle: "Sdach Game Ft. Tena",
  //   link: "https://www.facebook.com/share/v/17VHMwU4Gy/",
  //   linkText: "Watch Now",
  // },
];

// Animation variants for slide content
const imageVariants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: "easeOut" },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.6, ease: "easeOut" },
  },
};

export default function HeroCarousel({ banners = null }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Use dynamic banners if provided, otherwise fallback to hardcoded slides
  const slidesData =
    banners && banners.length > 0
      ? banners.map((banner) => ({
          id: banner.id,
          image: banner.image_url,
          title: banner.title,
          subtitle: banner.subtitle || "",
          link: banner.link_url || "",
          linkText: banner.link_text || "Shop Now",
        }))
      : slides;

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <div className="w-full h-[30rem] md:h-[36rem] lg:h-[46rem] overflow-hidden relative">
      <Swiper
        modules={[Autoplay, Pagination, Keyboard, EffectFade]}
        effect={"fade"}
        grabCursor={true}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000 }}
        pagination={{
          bulletClass: "custom-bullet",
          bulletActiveClass: `custom-bullet-active`,
          clickable: true,
        }}
        keyboard={{
          enabled: true,
        }}
        onSlideChange={handleSlideChange}
        className="w-full h-full"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <motion.div
                key={`image-${slide.id}-${activeIndex}`}
                variants={imageVariants}
                initial="hidden"
                animate={activeIndex === index ? "visible" : "hidden"}
                className="relative w-full h-full"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  quality={50}
                  sizes="100vw"
                  className="object-cover object-top"
                  priority={index === 0}
                />
              </motion.div>

              {/* Content Overlay */}
              <div className="absolute inset-0 bg-foreground/50 dark:bg-background/50 flex flex-col items-center justify-center text-background dark:text-foreground px-4 font-poppins text-center space-y-1.5 lg:space-y-2.5">
                {slide.title && (
                  <motion.h2
                    key={`title-${slide.id}-${activeIndex}`}
                    variants={titleVariants}
                    initial="hidden"
                    animate={activeIndex === index ? "visible" : "hidden"}
                    className="text-3xl md:text-4xl lg:text-[3.5rem] leading-none font-bold"
                  >
                    {slide.title}
                  </motion.h2>
                )}

                {slide.subtitle && (
                  <motion.p
                    key={`subtitle-${slide.id}-${activeIndex}`}
                    variants={subtitleVariants}
                    initial="hidden"
                    animate={activeIndex === index ? "visible" : "hidden"}
                    className="uppercase text-sm lg:text-lg tracking-widest"
                  >
                    {slide.subtitle}
                  </motion.p>
                )}

                {slide.link && (
                  <motion.div
                    key={`button-${slide.id}-${activeIndex}`}
                    variants={buttonVariants}
                    initial="hidden"
                    animate={activeIndex === index ? "visible" : "hidden"}
                  >
                    <Button
                      className="border-border border bg-transparent hover:bg-primary/20 dark:text-foreground dark:border-foreground dark:hover:bg-foreground/20 group font-medium mt-1.5 text-xs md:text-sm has-[>svg]:px-3.5"
                      size="sm"
                      asChild
                    >
                      <Link href={slide.link}>
                        {slide.linkText}
                        <MoveRight className="transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:scale-110" />
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
