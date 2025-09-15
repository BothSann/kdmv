import { getProductById } from "@/lib/apiProducts";
import { Button } from "@/components/ui/button";
import { PenLine, ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import ProductDetailsWithSelection from "@/components/ProductDetailsWithSelection";
import DeleteProductButton from "@/components/DeleteProductButton";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { product } = await getProductById(resolvedParams.productId);

  return {
    title: `${product.name}`,
  };
}
// If youe ever have a page that is not dynamic, you can use generateStaticParams to generate the static params
// This is useful for pages that are not dynamic and you want to pre-render the page

// export async function generateStaticParams() {
//   const products = await getAllProducts();
//   const productIds = products.map((product) => ({
//     productId: String(product.id),
//   }));

//   console.log(productIds);

//   return productIds;
// }

export default async function AdminProductDetailsPage({ params }) {
  const resolvedParams = await params;
  const { product } = await getProductById(resolvedParams.productId);

  return (
    <div className="mt-8">
      {/* Header */}
      <Header product={product} />

      <div className="grid grid-cols-[1fr_2fr] gap-6 mt-6">
        {/* Left Side */}
        <ProductDetailCarousel product={product} />

        {/* Right Side - Non-stretching grid */}
        <ProductDetailsWithSelection product={product} />
      </div>
    </div>
  );
}

function Header({ product }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">{product.name}</h2>
      </div>

      {/* Edit and Delete buttons */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/admin/products/${product.id}/edit`}>
            <PenLine />
            Edit
          </Link>
        </Button>
        <DeleteProductButton product={product} redirectTo="/admin/products" />
      </div>
    </div>
  );
}

function ProductDetailCarousel({ product }) {
  return (
    <div className="space-y-4">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="relative aspect-[1/1]">
              <Image
                src={product.banner_image_url}
                alt="carousel1"
                fill
                quality={100}
                className="rounded-lg object-cover object-center"
              />
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="relative aspect-[1/1]">
              <Image
                src="/kdmv-clothes-1.jpg"
                alt="carousel2"
                fill
                quality={100}
                className="rounded-lg object-cover object-top"
                // 4:3 ratio (taller)
              />
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="relative aspect-[1/1]">
              <Image
                src="/kdmv-clothes-1.jpg"
                alt="carousel3"
                fill
                quality={100}
                className="rounded-lg object-cover object-top"
              />
            </div>
          </CarouselItem>
          {/* ... other items */}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4" />
        <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4" />
      </Carousel>

      <Carousel>
        <CarouselContent>
          <CarouselItem className="basis-1/3">
            <div className="relative aspect-[1/1]">
              <Image
                src="/kdmv-clothes-1.jpg"
                alt="carousel1"
                fill
                quality={100}
                className="rounded-lg object-cover object-top"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="basis-1/3">
            <div className="relative aspect-[1/1]">
              <Image
                src="/kdmv-clothes-1.jpg"
                alt="carousel1"
                fill
                quality={100}
                className="rounded-lg object-cover object-top"
              />
            </div>
          </CarouselItem>
          <CarouselItem className="basis-1/3">
            <div className="relative aspect-[1/1]">
              <Image
                src="/kdmv-clothes-1.jpg"
                alt="carousel1"
                fill
                quality={100}
                className="rounded-lg object-cover object-top"
              />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
