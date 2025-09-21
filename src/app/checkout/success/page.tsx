
'use client'

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Loader2 } from "lucide-react";
import { products } from "@/lib/data";
import { useAuth } from "@/lib/contexts/auth-context";
import { useEffect, useState, useCallback, Suspense } from "react";
import type { Order, AppUser } from "@/lib/types";


function SuccessPageContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const findOrderInUser = useCallback((currentUser: AppUser, currentOrderId: string | null) => {
        if (!currentUser || !currentOrderId) return null;
        return currentUser.orders.find(o => o.id === currentOrderId) ?? null;
    }, []);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        
        if (user && orderId) {
            const foundOrder = findOrderInUser(user, orderId);
            setOrder(foundOrder);
            setLoading(false);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, orderId, authLoading, findOrderInUser]);


    const getProductDetails = (name: string) => {
        return products.find(p => p.name === name);
    }

    if (loading || authLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-muted/40">
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </main>
            </div>
        )
    }

    if (!orderId || !order) {
        return (
            <div className="flex min-h-screen flex-col bg-muted/40">
                <main className="flex-1 flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <CardHeader>
                            <CardTitle>Order Not Found</CardTitle>
                            <CardDescription>We couldn't find the details for this order. It may still be processing. Please check your order history shortly.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild variant="outline">
                                <Link href="/account/orders">View My Orders</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <main className="flex-1 flex items-center">
                <div className="container py-12 md:py-16">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <CardTitle className="font-headline text-2xl md:text-3xl mt-4">Order Successful!</CardTitle>
                            <CardDescription>
                                Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-border rounded-lg p-4 space-y-4">
                               <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order ID</span>
                                    <span className="font-medium">{order.id.slice(-6).toUpperCase()}</span>
                               </div>
                               <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order Date</span>
                                    <span className="font-medium">{new Date(order.date).toLocaleDateString()}</span>
                               </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium">{order.paymentMethod}</span>
                               </div>
                               <Separator />
                                <div className="space-y-4">
                                    {order.items.map(item => {
                                        const product = getProductDetails(item.name);
                                        return (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {product && <Image src={product.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover" />}
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium">${(product ? product.price * item.quantity : 0).toFixed(2)}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                <Separator />
                                 <div className="flex justify-between font-bold">
                                        <p>Total</p>
                                        <p>${order.total.toFixed(2)}</p>
                                 </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <Button asChild className="flex-1">
                                    <Link href="/">Continue Shopping</Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/account/orders">View Order History</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <>
            <SiteHeader />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            }>
                <SuccessPageContent />
            </Suspense>
            <SiteFooter />
        </>
    )
}
