"use server";

import { categorizeProductImage, CategorizeProductImageInput } from "@/ai/flows/product-image-categorization";
import { z } from "zod";

const actionSchema = z.object({
  photoDataUri: z.string().min(1, "Image is required."),
  description: z.string().min(1, "Description is required."),
});

type FormState = {
  success: boolean;
  categories?: string[];
  error?: string | null;
  details?: any;
};

export async function getCategories(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const validatedData = actionSchema.safeParse({
      photoDataUri: formData.get("photoDataUri"),
      description: formData.get("description"),
    });

    if (!validatedData.success) {
      return { success: false, error: "Invalid input data.", details: validatedData.error.flatten().fieldErrors };
    }

    const result = await categorizeProductImage(validatedData.data as CategorizeProductImageInput);
    return { success: true, categories: result.suggestedCategories };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred while contacting the AI service." };
  }
}
