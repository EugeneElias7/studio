"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { getCategories } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, PartyPopper, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Suggest Categories
    </Button>
  );
}

export default function CategorizeProductPage() {
  const initialState = { success: false, categories: [], error: null, details: null };
  const [state, formAction] = useActionState(getCategories, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setPhotoDataUri(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto mb-6">
                <Button asChild variant="outline"><Link href="/">← Back to Shop</Link></Button>
            </div>
            <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Product Image Categorization</CardTitle>
                <CardDescription>Upload a product image and description to get AI-powered category suggestions.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />
                    <input type="hidden" name="photoDataUri" value={photoDataUri} />
                </div>

                {preview && (
                    <div className="flex justify-center">
                    <Image src={preview} alt="Product preview" width={200} height={200} className="rounded-lg object-cover" />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="description">Product Description</Label>
                    <Textarea
                    id="description"
                    name="description"
                    placeholder="e.g., 'Fresh, organic red apples, perfect for snacking or baking.'"
                    required
                    />
                </div>
                </CardContent>
                <CardFooter>
                <SubmitButton />
                </CardFooter>
            </form>
            </Card>

            {state.success && state.categories && state.categories.length > 0 && (
            <Alert className="mt-8 max-w-2xl mx-auto border-green-500">
                <PartyPopper className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-600">Suggestions Ready!</AlertTitle>
                <AlertDescription>
                <p className="mb-4">Here are the suggested categories for your product:</p>
                <div className="flex flex-wrap gap-2">
                    {state.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-base px-3 py-1">{category}</Badge>
                    ))}
                </div>
                </AlertDescription>
            </Alert>
            )}

            {state.success === false && state.error && (
                <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>
                        {state.error as string}
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </div>
  );
}
