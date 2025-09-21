
'use server';
/**
 * @fileOverview A classification agent that suggests product categories.
 *
 * - getCategories - A function that handles the category suggestion process.
 * - GetCategoriesInput - The input type for the getCategories function.
 * - GetCategoriesOutput - The return type for the getCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCategoriesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the product.'),
});
export type GetCategoriesInput = z.infer<typeof GetCategoriesInputSchema>;

const GetCategoriesOutputSchema = z.object({
    success: z.boolean().describe('Whether the operation was successful.'),
    categories: z.array(z.string()).optional().describe('The suggested categories for the product.'),
    error: z.string().optional().describe('Any error that occurred.'),
    details: z.any().optional().describe('Additional details.'),
});
export type GetCategoriesOutput = z.infer<typeof GetCategoriesOutputSchema>;

export async function getCategories(prevState: any, formData: FormData): Promise<GetCategoriesOutput> {
    const input = GetCategoriesInputSchema.safeParse(Object.fromEntries(formData));

    if (!input.success) {
        return {
          success: false,
          error: 'Invalid input.',
          details: input.error.flatten(),
        };
    }
    try {
        const result = await getCategoriesFlow(input.data);
        return {
            success: true,
            categories: result.categories,
        };
    } catch(e: any) {
        return {
            success: false,
            error: e.message || 'An unexpected error occurred.'
        }
    }
}

const prompt = ai.definePrompt({
  name: 'getCategoriesPrompt',
  input: {schema: GetCategoriesInputSchema},
  output: {schema: z.object({ categories: z.array(z.string()) })},
  prompt: `You are an expert in product categorization. Based on the product image and description, suggest up to 5 relevant categories.

Product Description: {{{description}}}
Product Image: {{media url=photoDataUri}}`,
});

const getCategoriesFlow = ai.defineFlow(
  {
    name: 'getCategoriesFlow',
    inputSchema: GetCategoriesInputSchema,
    outputSchema: z.object({ categories: z.array(z.string()) }),
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
