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
            align: "start",
            loop: true,
          }}
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
                      quality={100}
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
            align: "start",
            loop: true,
            dragFree: true, // Makes thumbnails snap without momentum
          }}
        >
          <CarouselContent>
            {imagesToUse.map((image, index) => (
              <CarouselItem
                key={index}
                className="basis-1/3"
                onClick={() => handleGalleryClick(index)}
              >
                <div
                  className={`relative aspect-[1/1] border-2 ${
                    current === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.image_url}
                    fill
                    quality={100}
                    className="object-cover object-center cursor-grab active:cursor-grabbing"
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
