// Product Image Categorization Flow
'use server';

/**
 * @fileOverview An AI tool to analyze uploaded product images and suggest appropriate categories.
 *
 * - categorizeProductImage - A function that handles the product image categorization process.
 * - CategorizeProductImageInput - The input type for the categorizeProductImage function.
 * - CategorizeProductImageOutput - The return type for the categorizeProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeProductImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the product.'),
});
export type CategorizeProductImageInput = z.infer<typeof CategorizeProductImageInputSchema>;

const CategorizeProductImageOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested categories for the product image.'),
});
export type CategorizeProductImageOutput = z.infer<typeof CategorizeProductImageOutputSchema>;

export async function categorizeProductImage(
  input: CategorizeProductImageInput
): Promise<CategorizeProductImageOutput> {
  return categorizeProductImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeProductImagePrompt',
  input: {schema: CategorizeProductImageInputSchema},
  output: {schema: CategorizeProductImageOutputSchema},
  prompt: `You are an expert product categorization specialist. Analyze the product image and description provided, and suggest appropriate categories for the product.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Respond with an array of suggested categories. No more than 5.`,
});

const categorizeProductImageFlow = ai.defineFlow(
  {
    name: 'categorizeProductImageFlow',
    inputSchema: CategorizeProductImageInputSchema,
    outputSchema: CategorizeProductImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
