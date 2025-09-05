import { getProductById } from "@/lib/apiProducts";
import { Button } from "@/components/ui/button";
import { PenLine, Trash, CircleDollarSign } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell } from "@/components/ui/table";

import { TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export async function generateMetadata({ params }) {
  console.log(params.productId);
  const { product } = await getProductById(params.productId);

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
  const { product } = await getProductById(params.productId);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{product.name}</h2>

        {/* Edit and Delete buttons */}
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/admin/products/create?productId=${params.productId}`}>
              <PenLine />
              <span>Edit</span>
            </Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link href={`/admin/products/create?productId=${params.productId}`}>
              <Trash />
              <span>Delete</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-6 mt-6">
        {/* Left Side */}
        <div className="space-y-4">
          {/* Carousel Top*/}
          <Carousel>
            <CarouselContent>
              <CarouselItem>
                <div className="relative aspect-[1/1]">
                  <Image
                    src="/clothes1.jpg"
                    alt="carousel1"
                    fill
                    quality={100}
                    className="rounded-lg object-cover object-top"
                  />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="relative aspect-[1/1]">
                  <Image
                    src="/clothes1.jpg"
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
                    src="/clothes1.jpg"
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

          {/* Carousel Bottom*/}
          <Carousel>
            <CarouselContent>
              <CarouselItem className="basis-1/3">
                <div className="relative aspect-[1/1]">
                  <Image
                    src="/clothes1.jpg"
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
                    src="/clothes1.jpg"
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
                    src="/clothes1.jpg"
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

        {/* Right Side - Non-stretching grid */}
        <div>
          <div className="grid grid-cols-3 gap-4 items-start mb-4">
            {/* Price */}
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <CircleDollarSign className="text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Price</span>
                <span className="text-lg text-zinc-800 font-semibold">
                  ${product.base_price}
                </span>
              </div>
            </div>
            {/* Available Stocks */}
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <CircleDollarSign className="text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  Available Stocks
                </span>
                <span className="text-lg text-zinc-800 font-semibold">
                  {product.total_stock}
                </span>
              </div>
            </div>
            {/* Category / Subcategory */}
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <CircleDollarSign className="text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">
                  Category / Subcategory
                </span>
                <span className="text-lg text-zinc-800 font-semibold">
                  {product.category_name} / {product.subcategory_name}
                </span>
              </div>
            </div>
          </div>

          {/* Below the grid */}
          <Card>
            <CardContent>
              <div className="grid grid-cols-[2fr_1fr] gap-4">
                {/* Product Description */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">
                    Product Description:
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>
                {/* Product Code, Subcategory, Slug using table */}
                <div className="rounded-md border">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Product Code
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.product_code}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Subcategory
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.subcategory_name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Slug</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.slug}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="grid auto-cols-max grid-flow-row gap-8">
                {/* Avaiable Colors */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Avaiable Colors:</h2>
                  <div className="flex gap-2">
                    {product.product_variants.map((variant) => {
                      const getColorStyle = (colorName) => {
                        const colorMap = {
                          Blue: "bg-blue-500",
                          Black: "bg-black",
                          White: "bg-white border border-gray-300",
                        };
                        return colorMap[colorName] || "bg-gray-400";
                      };

                      return (
                        <div
                          key={variant.id}
                          className={`w-8 h-8 rounded-full ${getColorStyle(
                            variant.colors?.name
                          )}`}
                          title={variant.colors?.name}
                        ></div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">Avaiable Sizes:</h2>
                  <RadioGroup className="flex gap-2 flex-wrap">
                    {product.product_variants.map((variant) => {
                      return (
                        <div key={variant.id}>
                          <RadioGroupItem
                            value={variant.sizes?.name}
                            id={variant.sizes?.name}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor={variant.sizes?.name}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300  text-sm font-medium cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white peer-data-[state=checked]:border-black [&:has([data-state=checked])]:bg-black [&:has([data-state=checked])]:text-white [&:has([data-state=checked])]:border-black transition-colors"
                          >
                            {variant.sizes?.name}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
