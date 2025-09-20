"use client";

import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Carrot } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import { useCart } from "@/lib/contexts/cart-context";
import { useState } from "react";
import { CartSheet } from "../cart/cart-sheet";
import { Badge } from "../ui/badge";

export function SiteHeader() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-20 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/" className="flex items-center space-x-2 font-headline text-2xl font-bold text-primary">
            <Carrot className="h-8 w-8" />
            <span>Localit</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <MainNav />
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-primary-foreground">
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">Open cart</span>
              </Button>
              <UserNav />
            </nav>
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
