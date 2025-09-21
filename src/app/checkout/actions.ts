
"use server";

import { z } from "zod";
import { checkoutSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import type { CartItem, Order, Address } from "@/lib/types";
import { userAddresses } from "@/lib/data";

type FormState = {
  success: boolean;
  error?: string | null;
};

// A mock function to simulate payment processing
const processPayment = (
  values: z.infer<typeof checkoutSchema>
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // No more validation error
      resolve({ success: true });
    }, 1500);
  });
};

export async function placeOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const values = Object.fromEntries(formData.entries());
    const validatedData = checkoutSchema.safeParse(values);
    
    if (!validatedData.success) {
      console.log(validatedData.error.flatten().fieldErrors);
      return { success: false, error: "Invalid form data. Please check your entries." };
    }

    // Simulate payment processing
    const paymentResult = await processPayment(validatedData.data);
    if (!paymentResult.success) {
      return { success: false, error: paymentResult.error };
    }

    // Get cart items from cookie
    const cartCookie = cookies().get("cartItems");
    if (!cartCookie) {
      return { success: false, error: "Your cart is empty." };
    }
    
    // NOTE: We cannot call the `addOrder` from the auth context here as it's a client context hook.
    // The order placement will be handled on the client-side after this action returns a success state.
    // We clear the cart cookie here as a final step on the server.
    
    cookies().set("cartItems", "[]"); // Clear cart cookie

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

    