
import * as z from "zod";

export const checkoutSchema = z.object({
    userId: z.string().min(1, "User ID is missing."),
    cartItems: z.string().min(3, "Cart items are missing."), // JSON array "[]" is 2 chars
    shippingAddress: z.string().min(1, "Please select a shipping address"),
    
    // Fields for new address (optional at this level)
    newAddressStreet: z.string().optional(),
    newAddressCity: z.string().optional(),
    newAddressState: z.string().optional(),
    newAddressZip: z.string().optional(),

    paymentMethod: z.enum(["creditCard", "cod"]),
    
    // Fields for credit card (optional at this level)
    cardholderName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
}).superRefine((data, ctx) => {
    // If 'new' address is selected, all new address fields are required.
    if (data.shippingAddress === 'new') {
        if (!data.newAddressStreet || data.newAddressStreet.trim().length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddressStreet'], message: 'Street is required.' });
        }
        if (!data.newAddressCity || data.newAddressCity.trim().length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddressCity'], message: 'City is required.' });
        }
        if (!data.newAddressState || data.newAddressState.trim().length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddressState'], message: 'State is required.' });
        }
        if (!data.newAddressZip || !/^\d{5}$/.test(data.newAddressZip)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newAddressZip'], message: 'A valid 5-digit zip code is required.' });
        }
    }

    // If 'creditCard' is selected, all credit card fields are required.
    if (data.paymentMethod === 'creditCard') {
        if (!data.cardholderName || data.cardholderName.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardholderName'], message: 'Cardholder name is required.' });
        }
        if (!data.cardNumber || !/^\d{13,19}$/.test(data.cardNumber.replace(/\s/g, ''))) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cardNumber'], message: 'Please enter a valid card number.' });
        }
        if (!data.expiryDate || !/^(0[1-9]|1[0-2])\s*\/\s*([2-9][0-9])$/.test(data.expiryDate)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Expiry must be in MM/YY format.' });
        }
        if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['cvv'], message: 'CVV must be 3 or 4 digits.' });
        }
    }
});

export const addressSchema = z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(5, "A valid zip code is required"),
});
