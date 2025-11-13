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
import { motion, AnimatePresence } from "framer-motion";

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
            duration: 25,
          }}
          plugins={[Autoplay({ delay: 2500, stopOnMouseEnter: true })]}
        >
          <CarouselContent>
            {imagesToUse.map((image, index) => (
              <CarouselItem key={index}>
                <motion.div
                  className="relative aspect-[1/1]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={
                    current === index
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 1, scale: 1 }
                  }
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <PhotoView src={image.image_url}>
                    <motion.div
                      key={`main-${index}-${current}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: current === index ? 1 : 0.7 }}
                      transition={{ duration: 0.6 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={image.image_url}
                        alt={image.image_url}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={80}
                        priority
                        className="object-cover object-center cursor-zoom-in"
                      />
                    </motion.div>
                  </PhotoView>
                </motion.div>
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
            duration: 25,
          }}
        >
          <CarouselContent>
            {imagesToUse.map((image, index) => (
              <CarouselItem
                key={index}
                className="basis-1/4 lg:basis-1/5"
                onClick={() => handleGalleryClick(index)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative aspect-square border-2 dark:border-3 ${
                    current === index
                      ? "border-primary dark:border-chart-3"
                      : "border-transparent"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={image.image_url}
                      alt={image.image_url}
                      fill
                      sizes="(max-width: 1024px) 25vw, 10vw"
                      quality={50}
                      loading="lazy"
                      className="object-cover object-center cursor-pointer active:cursor-grabbing"
                    />
                  </motion.div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </PhotoProvider>
  );
}
