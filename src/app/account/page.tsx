
"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8">My Account</h1>
            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.displayName ?? ""} />
                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">{user.displayName}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Button asChild variant="outline" className="w-full">
                                <Link href="/account/orders">View Orders</Link>
                            </Button>
                            <Button variant="secondary" className="w-full" disabled>Edit Profile</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Details</CardTitle>
                            <CardDescription>Manage your personal information and shipping addresses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold">Addresses</h3>
                                {user.addresses && user.addresses.length > 0 ? (
                                    user.addresses.map(addr => (
                                        <div key={addr.id} className="border p-4 rounded-md">
                                            <p className="font-medium">{addr.street}</p>
                                            <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                                            {addr.isDefault && <p className="text-xs text-primary font-medium mt-1">Default</p>}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">You have no saved addresses.</p>
                                )}
                            </div>
                             <Button disabled>Add New Address</Button>
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
