import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { products } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <div className="mb-6">
            <Button asChild variant="outline"><Link href="/">← All Products</Link></Button>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.imageHint}
              />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex gap-2 mb-2">
                    <Badge>{product.category}</Badge>
                    {product.subcategory && <Badge variant="secondary">{product.subcategory}</Badge>}
                </div>
                <h1 className="font-headline text-4xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-yellow-300" />
                    </div>
                    <span className="text-sm text-muted-foreground">(123 reviews)</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground">{product.description}</p>
              
              <div className="text-4xl font-bold font-headline">${product.price.toFixed(2)}</div>
              
              <AddToCartButton product={product} />

            </div>
          </div>
        </div>
        <section className="container py-16">
            <h2 className="font-headline text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
