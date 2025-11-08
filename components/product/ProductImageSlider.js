"use client";

import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import { PhotoProvider, PhotoView } from "react-photo-view";

export default function ProductImageSlider({ product }) {
  const [mainApi, setMainApi] = useState(null);
  const [galleryApi, setGalleryApi] = useState(null);
  const [current, setCurrent] = useState(0);

  const hasProductImages = product?.product_images?.length > 0;
  const hasBannerImage = !!product?.banner_image_url;

  const imagesToUse = hasProductImages
    ? product.product_images
    : hasBannerImage
    ? [{ image_url: product.banner_image_url }]
    : [{ image_url: "/placeholder-image.jpg" }];

  useEffect(() => {
    if (!mainApi || !galleryApi) return;

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setCurrent(index);
      galleryApi.scrollTo(index);
    };

    mainApi.on("select", onSelect);
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, galleryApi]);

  const handleGalleryClick = (index) => {
    setCurrent(index);
    mainApi?.scrollTo(index);
  };

  return (
    <PhotoProvider>
      <div className="space-y-4">
        {/* Main Image Carousel */}
        <Carousel
          setApi={setMainApi}
          opts={{
            align: "center",
            loop: true,
            duration: 250,
          }}
          plugins={[Autoplay({ delay: 2500, stopOnMouseEnter: true })]}
        >
          <CarouselContent>
            {imagesToUse.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-[1/1]">
                  <PhotoView src={image.image_url}>
                    <Image
                      src={image.image_url}
                      alt={image.image_url}
                      fill
                      sizes="100vw"
                      quality={80}
                      loading="lazy"
                      className="object-cover object-center cursor-zoom-in"
                    />
                  </PhotoView>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4" />
          <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4" />
        </Carousel>

        {/* Gallery Carousel */}
        <Carousel
          setApi={setGalleryApi}
          opts={{
            align: "center",
            loop: true,
            dragFree: true, // Makes thumbnails snap without momentum
            duration: 250,
          }}
        >
          <CarouselContent>
            {imagesToUse.map((image, index) => (
              <CarouselItem
                key={index}
                className="basis-1/4 lg:basis-1/5"
                onClick={() => handleGalleryClick(index)}
              >
                <div
                  className={`relative aspect-square border-2 dark:border-3 ${
                    current === index
                      ? "border-primary dark:border-chart-3"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.image_url}
                    fill
                    sizes="100vw"
                    loading="lazy"
                    className="object-cover object-center cursor-pointer active:cursor-grabbing"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </PhotoProvider>
  );
}
