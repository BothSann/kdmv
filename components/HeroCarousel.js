"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css/bundle";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

const slides = [
  {
    id: "1",
    image: "/carousel4.jpg",
    title: "Straight Edge 2.0",
    subtitle: "Hoodies back for good!",
    link: "/collections/new-products",
    linkText: "Shop Straight Edge",
  },
  {
    id: "2",
    image: "/carousel5.jpg",
    title: "OFF THE PIER MERCH",
    subtitle: "",
    link: "/collections/off-the-pier",
    linkText: "Shop Now",
  },
  {
    id: "3",
    image: "/carousel6.jpg",
    title: "KDMV x TENA",
    subtitle: "Limited Edition Collection",
    // link: "/collections/straight-edge-collection",
    linkText: "Shop",
  },
];

export default function HeroCarousel() {
  return (
    <div className="w-full aspect-[16/9] md:aspect-[26/9] overflow-hidden relative">
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
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-top "
                priority={slide.id === "1"}
              />
              <div className="absolute inset-0 bg-foreground/50 dark:bg-background/50 flex flex-col items-center justify-center text-background dark:text-foreground px-4 font-poppins text-center">
                {slide.title && (
                  <h2 className="text-6xl font-bold mb-3">{slide.title}</h2>
                )}

                {slide.subtitle && (
                  <p className="mb-4 uppercase text-lg tracking-widest">
                    {slide.subtitle}
                  </p>
                )}

                {slide.link && (
                  <Button
                    className="border-border border bg-transparent hover:bg-primary/20 dark:text-foreground dark:border-foreground dark:hover:bg-foreground/20 group font-semibold"
                    asChild
                  >
                    <Link href={slide.link}>
                      {slide.linkText}
                      <MoveRight className=" transition-all duration-300 ease-in-out group-hover:opacity-100  group-hover:translate-x-0.5 group-hover:scale-110" />
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
