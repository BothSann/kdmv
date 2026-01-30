import NotFound from "@/components/NotFound";
import { getCollectionById } from "@/lib/data/collections";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Code,
  FileText,
  GalleryThumbnails,
  Package2,
  PenLine,
  Shapes,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { formatISODateToDayDateMonthYearWithAtTime } from "@/lib/utils";
import CollectionProductSelector from "@/components/collection/CollectionProductSelector";
import DeleteCollectionButton from "@/components/collection/DeleteCollectionButton";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { collection, error } = await getCollectionById(
    resolvedParams.collectionId
  );

  if (error || !collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `Collection | ${collection.name}`,
  };
}

export default async function CollectionDetailPage({ params }) {
  const resolvedParams = await params;
  const { collection, error } = await getCollectionById(
    resolvedParams.collectionId
  );

  if (error || !collection) {
    return <NotFound href="/admin/collections" title="Collection" />;
  }

  return (
    <>
      <Header collection={collection} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mt-10 lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GalleryThumbnails />
                Collection Banner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[16/9]">
                {collection.banner_image_url ? (
                  <Image
                    src={collection.banner_image_url}
                    alt={collection.name}
                    fill
                    className="object-cover object-center"
                    quality={100}
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <Shapes size={120} className="text-ring" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="text-sm">
                    {formatISODateToDayDateMonthYearWithAtTime(
                      collection.created_at
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="text-sm">
                    {formatISODateToDayDateMonthYearWithAtTime(
                      collection.updated_at
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText />
                Collection Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Collection Name
                  </Label>
                  <p className="text-lg font-semibold">{collection.name}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Collection ID</Label>
                  <span className="font-mono text-sm bg-muted px-2 py-1">
                    {collection.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Collection Description
                  </Label>
                  <p className="text-sm pr-4">{collection.description}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Collection Slug
                  </Label>
                  <span className="font-mono text-sm bg-muted px-2 py-1">
                    {collection.slug}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 />
                Collection Products
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <CollectionProductSelector
                products={collection.products}
                existingProductIds={collection.products?.map((p) => p.id) || []}
                isViewMode={true}
                collectionId={collection.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Header({ collection }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/admin/collections">
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold">{collection.name}</h2>
      </div>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/admin/collections/${collection.id}/edit`}>
            <PenLine />
            Edit
          </Link>
        </Button>

        <DeleteCollectionButton
          collection={collection}
          redirectTo="/admin/collections"
        />
      </div>
    </div>
  );
}
