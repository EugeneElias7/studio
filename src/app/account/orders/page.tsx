
"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router, isClient]);

  const sortedOrders = useMemo(() => {
    if (!user?.orders) return [];
    // Create a new array before sorting to avoid mutating the original
    return [...user.orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user?.orders]);


  if (!isClient || loading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-muted/40">
        <div className="container py-12">
            <div className="mb-6">
                <Button asChild variant="outline"><Link href="/account">← My Account</Link></Button>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8">My Orders</h1>
            
            <div className="space-y-8">
                {sortedOrders.length > 0 ? (
                    sortedOrders.map(order => (
                        <Card key={order.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
                                        <CardDescription>Date: {format(new Date(order.date), 'PPP')}</CardDescription>
                                    </div>
                                    <Badge variant={order.status === 'Processing' ? 'secondary' : 'default'}>{order.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm">
                                            <p>{item.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold">${order.total.toFixed(2)}</span>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16 border-dashed border-2 rounded-lg">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No Orders Yet</h2>
                        <p className="mt-2 text-muted-foreground">You haven't placed any orders with us yet. Let's change that!</p>
                        <Button asChild className="mt-6">
                            <Link href="/">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
