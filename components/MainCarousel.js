"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

export default function MainCarousel() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      opts={{ loop: true }}
    >
      <CarouselContent>
        <CarouselItem>
          <div className="relative aspect-[21/9]">
            <Image
              src="/carousel4.jpg"
              alt="carousel1"
              fill
              quality={100}
              className="rounded-lg object-cover"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="relative aspect-[21/9]">
            <Image
              src="/carousel5.jpg"
              alt="carousel2"
              fill
              quality={100}
              className="rounded-lg object-cover"
              // 4:3 ratio (taller)
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="relative aspect-[21/9]">
            <Image
              src="/carousel6.jpg"
              alt="carousel3"
              fill
              quality={100}
              className="rounded-lg object-cover"
            />
          </div>
        </CarouselItem>
        {/* ... other items */}
      </CarouselContent>
      <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4" />
      <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4" />
    </Carousel>
  );
}

// <div className="relative aspect-[1/0.7]">
