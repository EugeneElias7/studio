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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Truck } from "lucide-react";

const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "Zip code must be 5 digits"),
});

const checkoutSchema = z.object({
    shippingAddress: z.string().min(1, "Please select a shipping address"),
    newAddress: addressSchema.optional(),
    cardholderName: z.string().min(1, "Cardholder name is required"),
    cardNumber: z.string().min(16, "Card number must be 16 digits").max(16),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    cvv: z.string().min(3, "CVV must be 3 digits").max(4),
});

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const form = useForm<z.infer<typeof checkoutSchema>>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            shippingAddress: user?.addresses?.find(a => a.isDefault)?.id || "new",
            newAddress: { street: "", city: "", state: "", zip: "" },
            cardholderName: "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
        },
    });

    function onSubmit(values: z.infer<typeof checkoutSchema>) {
        console.log(values);
        // Here you would typically process the payment and create an order.
        // For this demo, we'll just clear the cart and redirect.
        clearCart();
        toast({
            title: "Order Placed!",
            description: "Thank you for your purchase. Your order is being processed.",
        });
        router.push("/");
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
        )
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
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

                                    <Button type="submit" size="lg" className="w-full">Place Order - ${cartTotal.toFixed(2)}</Button>
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
    )
}
