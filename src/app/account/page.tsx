
"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, AlertCircle, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { updateProfile } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
        </Button>
    )
}

export default function AccountPage() {
  const { user, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialState = { success: false, message: "" };
  const [state, formAction] = useActionState(updateProfile, initialState);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router, isClient]);

  useEffect(() => {
    if (state.success) {
      refreshUserData(); // Refresh user data from auth context
      setIsDialogOpen(false); // Close dialog on success
    }
  }, [state.success, refreshUserData]);

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
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="w-full">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Update your personal information.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form action={formAction} className="space-y-4">
                                        <input type="hidden" name="uid" value={user.uid} />
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Full Name</Label>
                                            <Input id="displayName" name="displayName" defaultValue={user.displayName} />
                                        </div>
                                         {state.success === false && state.message && (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>{state.message}</AlertDescription>
                                            </Alert>
                                        )}
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="ghost">Cancel</Button>
                                            </DialogClose>
                                            <SubmitButton />
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
