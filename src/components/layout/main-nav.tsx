"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground" : "text-foreground/60"
          )}
        >
          All Products
        </Link>
        {categories.map((category) => (
            <Link
            key={category.id}
            href={`/category/${category.id}`}
            className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith(`/category/${category.id}`)
                ? "text-foreground"
                : "text-foreground/60"
            )}
            >
            {category.name}
            </Link>
        ))}
      </nav>
    </div>
  );
}
