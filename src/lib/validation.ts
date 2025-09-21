
"use client";
import * as z from "zod";

export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "A valid zip code is required"),
});

export const checkoutSchema = z.object({
    userId: z.string().min(1, "User ID is missing."),
    cartItems: z.string().min(1, "Cart items are missing."),
    shippingAddress: z.string().min(1, "Please select a shipping address"),
    newAddress: addressSchema.optional(),
    paymentMethod: z.enum(["creditCard", "cod"]),
    cardholderName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.shippingAddress === 'new') {
        const result = addressSchema.safeParse(data.newAddress);
        if (!result.success) {
            result.error.issues.forEach(issue => {
                // Prepend 'newAddress' to the path to match form input names
                ctx.addIssue({
                    ...issue,
                    path: [('newAddress' + issue.path[0].charAt(0).toUpperCase() + issue.path[0].slice(1)) as any],
                });
            });
        }
    }

    if (data.paymentMethod === 'creditCard') {
        if (!data.cardholderName || data.cardholderName.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardholderName'], message: 'Cardholder name is required.' });
        }
        if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardNumber'], message: 'Card number must be 16 digits.' });
        }
        if (!data.expiryDate || !/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(data.expiryDate)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Expiry date must be in MM/YY format.' });
        }
        if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cvv'], message: 'CVV must be 3 or 4 digits.' });
        }
    }
});
