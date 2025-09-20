"use client";

import { useCart } from "@/lib/contexts/cart-context";
import type { Product } from "@/lib/types";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Minus, Plus } from "lucide-react";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addToCart(product, quantity);
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add to Cart
            </Button>
        </div>
    );
}
