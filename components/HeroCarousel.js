"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css/bundle";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

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

export default function HeroCarousel({ banners = null }) {
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

  return (
    <div className="w-full aspect-[16/15] md:aspect-[26/10] overflow-hidden relative">
      <Swiper
        modules={[Autoplay, Pagination, Keyboard]}
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
        className="w-full h-full"
      >
        {slidesData.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                quality={100}
                className="object-cover object-top"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-foreground/50 dark:bg-background/50 flex flex-col items-center justify-center text-background dark:text-foreground px-4 font-poppins text-center space-y-1.5">
                {slide.title && (
                  <h2 className="text-3xl lg:text-6xl font-bold">
                    {slide.title}
                  </h2>
                )}

                {slide.subtitle && (
                  <p className="uppercase text-sm lg:text-lg tracking-widest">
                    {slide.subtitle}
                  </p>
                )}

                {slide.link && (
                  <Button
                    className="border-border border bg-transparent hover:bg-primary/20 dark:text-foreground dark:border-foreground dark:hover:bg-foreground/20 group font-semibold mt-1.5 size-sm lg:size-default"
                    asChild
                  >
                    <Link href={slide.link}>
                      {slide.linkText}
                      <MoveRight className="transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:scale-110" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
