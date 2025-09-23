"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";

export default function ProductDetailCarousel() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>
          <div className="relative aspect-[9/12]">
            <Image
              src="/detailcarousel1.jpg"
              alt="carousel1"
              fill
              quality={100}
              className="rounded-lg object-cover object-top"
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="relative aspect-[9/12]">
            <Image
              src="/detailcarousel1.jpg"
              alt="carousel2"
              fill
              quality={100}
              className="rounded-lg object-cover object-top"
              // 4:3 ratio (taller)
            />
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="relative aspect-[9/12]">
            <Image
              src="/detailcarousel1.jpg"
              alt="carousel3"
              fill
              quality={100}
              className="rounded-lg object-cover object-top"
            />
          </div>
        </CarouselItem>
        {/* ... other items */}
      </CarouselContent>
      <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4 dark:bg-white dark:text-black" />
      <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4 dark:bg-white dark:text-black" />
    </Carousel>
  );
}

// <div className="relative aspect-[1/0.7]">
