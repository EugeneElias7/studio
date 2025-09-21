
"use client";

import { useCart } from "@/lib/contexts/cart-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFormStatus, useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Truck, AlertCircle, Loader2 } from "lucide-react";
import { placeOrder as placeOrderAction } from "./actions";
import { useRouter } from "next/navigation";


function SubmitButton({ cartTotal }: { cartTotal: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Place Order - ${cartTotal.toFixed(2)}
    </Button>
  );
}

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    
    const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.find(a => a.isDefault)?.id || "new");

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [state, formAction] = useActionState(placeOrderAction, { success: false, error: null, orderId: null });

    useEffect(() => {
        if (state.success && state.orderId) {
            clearCart(); // Clear cart from client-side context
            router.push(`/checkout/success?orderId=${state.orderId}`);
        }
    }, [state, router, clearCart]);


    if (!isClient) {
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
    
    if (cartItems.length === 0) {
        return (
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                        <p className="text-muted-foreground mb-8">You can't checkout with an empty cart. Let's go shopping!</p>
                        <Button asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </main>
                <SiteFooter />
            </div>
        );
    }
    
    if (!user) {
         return (
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
                        <p className="text-muted-foreground mb-8">You need to be logged in to checkout.</p>
                        <Button asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                    </div>
                </main>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                <div className="container py-12">
                    <div className="mb-6">
                        <Button asChild variant="outline"><Link href="/">← Continue Shopping</Link></Button>
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        <div className="lg:col-span-2">
                            <form action={formAction} className="space-y-8">
                                <input type="hidden" name="userId" value={user.uid} />
                                <input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup name="shippingAddress" onValueChange={setSelectedAddress} value={selectedAddress} className="space-y-4">
                                            {user?.addresses?.map(addr => (
                                                <div key={addr.id} className="flex items-center space-x-3 space-y-0">
                                                    <RadioGroupItem value={addr.id} id={addr.id} />
                                                    <Label htmlFor={addr.id} className="font-normal w-full cursor-pointer">
                                                        <div className="border p-4 rounded-md hover:border-primary">
                                                            <p className="font-medium">{addr.street}</p>
                                                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                            <div className="flex items-center space-x-3 space-y-0">
                                                <RadioGroupItem value="new" id="new-address" />
                                                <Label htmlFor="new-address" className="font-normal w-full cursor-pointer">
                                                    <div className="border p-4 rounded-md hover:border-primary">Add a new address</div>
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        {selectedAddress === "new" && (
                                            <div className="mt-4 p-4 border rounded-lg space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="newAddress.street">Street</Label>
                                                    <Input name="newAddress.street" id="newAddress.street" placeholder="123 Main St" required />
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="newAddress.city">City</Label>
                                                        <Input name="newAddress.city" id="newAddress.city" placeholder="Anytown" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="newAddress.state">State</Label>
                                                        <Input name="newAddress.state" id="newAddress.state" placeholder="CA" required />
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor="newAddress.zip">Zip Code</Label>
                                                        <Input name="newAddress.zip" id="newAddress.zip" placeholder="90210" required />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                                            <Input name="cardholderName" id="cardholderName" placeholder="John Doe" required defaultValue={user.displayName ?? ""} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input name="cardNumber" id="cardNumber" placeholder="•••• •••• •••• ••••" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                                <Input name="expiryDate" id="expiryDate" placeholder="MM/YY" required />
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input name="cvv" id="cvv" placeholder="123" required />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {state.success === false && state.error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Checkout Error</AlertTitle>
                                        <AlertDescription>{state.error}</AlertDescription>
                                    </Alert>
                                )}
                                <SubmitButton cartTotal={cartTotal} />
                            </form>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <p>Subtotal</p>
                                        <p>${cartTotal.toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <p>Taxes</p>
                                        <p>Calculated at next step</p>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground text-sm">
                                        <p>Shipping</p>
                                        <p>Calculated at next step</p>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <p>Total</p>
                                        <p>${cartTotal.toFixed(2)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
