import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/products/product-card";
import { products, categories } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CategoryPage({ params }: { params: { categoryId: string } }) {
  const category = categories.find((c) => c.id === params.categoryId);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter(
    (p) => p.category === params.categoryId
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container py-12">
            <div className="mb-8">
                <Button asChild variant="outline"><Link href="/">← All Products</Link></Button>
            </div>
          <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
              {category.name}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Browse our selection of fresh {category.name.toLowerCase()}.
            </p>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                No products found in this category yet.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}