
"use server";

import { z } from "zod";
import { checkoutSchema } from "@/lib/validation";
import { cookies } from "next/headers";

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
      resolve({ success: true });
    }, 1500);
  });
};

export async function placeOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // The new address fields are nested, so we need to process them.
    const values = {
      ...rawData,
      newAddress: {
        street: rawData['newAddress.street'],
        city: rawData['newAddress.city'],
        state: rawData['newAddress.state'],
        zip: rawData['newAddress.zip'],
      }
    };
    
    // Remove the flat new address fields as they are now nested.
    delete values['newAddress.street'];
    delete values['newAddress.city'];
    delete values['newAddress.state'];
    delete values['newAddress.zip'];

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
    
    cookies().set("cartItems", "[]"); // Clear cart cookie

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
