
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
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Truck, AlertCircle, Loader2 } from "lucide-react";
import { placeOrder as placeOrderAction } from "./actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/lib/validation";
import type { z } from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, Address } from "@/lib/types";


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
    const { user, addOrder } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const [state, formAction] = useActionState(placeOrderAction, { success: false, error: null });

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            shippingAddress: user?.addresses?.find(a => a.isDefault)?.id || "new",
            newAddress: { street: "", city: "", state: "", zip: "" },
            cardholderName: user?.displayName || "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
        },
    });

    useEffect(() => {
        if (user && isClient) {
            form.reset({
                shippingAddress: user?.addresses?.find(a => a.isDefault)?.id || "new",
                newAddress: { street: "", city: "", state: "", zip: "" },
                cardholderName: user.displayName || "",
                cardNumber: "",
                expiryDate: "",
                cvv: "",
            })
        }
    }, [user, isClient, form]);
    
    useEffect(() => {
        const createOrder = async () => {
            if (!user || !isClient) return;

            const values = form.getValues();
            let shippingAddress: Address;

            if (values.shippingAddress === 'new') {
                shippingAddress = { id: `addr${Date.now()}`, ...values.newAddress!, isDefault: false };
            } else {
                const foundAddress = user.addresses.find(a => a.id === values.shippingAddress);
                if (!foundAddress) {
                    console.error("Selected address not found");
                    return;
                }
                shippingAddress = foundAddress;
            }

            const orderData: Omit<Order, 'id' | 'userId'> = {
                date: new Date().toISOString(),
                status: 'Processing',
                items: cartItems.map(({ id, imageUrl, ...rest }) => rest),
                total: cartTotal,
                shippingAddress: shippingAddress,
            };
            
            try {
                const newOrder = await addOrder(orderData);
                if (newOrder) {
                    clearCart();
                    router.push(`/checkout/success?orderId=${newOrder.id}`);
                } else {
                    console.error("Order creation failed on client.");
                }
            } catch (e) {
                console.error("Error creating order", e);
            }
        };

        if (state.success && isClient) {
            createOrder();
        }
    }, [state.success, user, form, cartItems, cartTotal, addOrder, clearCart, router, isClient]);


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
                             <Form {...form}>
                                <form action={formAction} className="space-y-8">
                                    <input type="hidden" name="shippingAddress" value={form.watch('shippingAddress')} />
                                    <input type="hidden" name="newAddress.street" value={form.watch('newAddress.street')} />
                                    <input type="hidden" name="newAddress.city" value={form.watch('newAddress.city')} />
                                    <input type="hidden" name="newAddress.state" value={form.watch('newAddress.state')} />
                                    <input type="hidden" name="newAddress.zip" value={form.watch('newAddress.zip')} />

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping Address</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <FormField
                                                control={form.control}
                                                name="shippingAddress"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-4">
                                                            {user?.addresses?.map(addr => (
                                                                <FormItem key={addr.id} className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={addr.id} />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal w-full cursor-pointer">
                                                                        <div className="border p-4 rounded-md hover:border-primary">
                                                                            <p className="font-medium">{addr.street}</p>
                                                                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                                                                        </div>
                                                                    </FormLabel>
                                                                </FormItem>
                                                            ))}
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="new" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal w-full cursor-pointer">
                                                                     <div className="border p-4 rounded-md hover:border-primary">Add a new address</div>
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {form.watch("shippingAddress") === "new" && (
                                                <div className="mt-4 p-4 border rounded-lg space-y-4">
                                                    <FormField control={form.control} name="newAddress.street" render={({ field }) => (
                                                        <FormItem><FormLabel>Street</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <FormField control={form.control} name="newAddress.city" render={({ field }) => (
                                                            <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="newAddress.state" render={({ field }) => (
                                                            <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="newAddress.zip" render={({ field }) => (
                                                            <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="90210" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
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
                                            <FormField control={form.control} name="cardholderName" render={({ field }) => (
                                                <FormItem><FormLabel>Cardholder Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="cardNumber" render={({ field }) => (
                                                <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                                    <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="cvv" render={({ field }) => (
                                                    <FormItem><FormLabel>CVV</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
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
                            </Form>
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

    