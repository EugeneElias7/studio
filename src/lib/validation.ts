
"use client";
import * as z from "zod";

export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "Zip code must be 5 digits"),
});

export const checkoutSchema = z.object({
    userId: z.string().min(1, "User ID is missing."),
    shippingAddress: z.string().min(1, "Please select a shipping address"),
    newAddress: addressSchema.optional(),
    paymentMethod: z.enum(["creditCard", "cod"]),
    cardholderName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    cartItems: z.string().min(1, "Cart items are missing."),
}).superRefine((data, ctx) => {
    if (data.shippingAddress === 'new') {
        if (!data.newAddress?.street) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddress.street'], message: 'Street is required for a new address.' });
        }
        if (!data.newAddress?.city) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddress.city'], message: 'City is required for a new address.' });
        }
        if (!data.newAddress?.state) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddress.state'], message: 'State is required for a new address.' });
        }
        if (!data.newAddress?.zip) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddress.zip'], message: 'Zip code is required for a new address.' });
        }
    }

    if (data.paymentMethod === 'creditCard') {
        if (!data.cardholderName) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardholderName'], message: 'Cardholder name is required.' });
        }
        if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardNumber'], message: 'Card number must be 16 digits.' });
        }
        if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Invalid expiry date (MM/YY).' });
        }
        if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cvv'], message: 'CVV must be 3-4 digits.' });
        }
    }
});
