"use client";
import * as z from "zod";

export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "Zip code must be 5 digits"),
});

export const checkoutSchema = z.object({
    shippingAddress: z.string().min(1, "Please select a shipping address"),
    newAddress: addressSchema.optional(),
    cardholderName: z.string().min(1, "Cardholder name is required"),
    cardNumber: z.string().min(16, "Card number must be 16 digits").max(16),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
    cvv: z.string().min(3, "CVV must be 3 digits").max(4),
});
