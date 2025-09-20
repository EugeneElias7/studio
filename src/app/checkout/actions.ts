"use server";

import { z } from "zod";
import { checkoutSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import type { CartItem, Order, Address } from "@/lib/types";
import { products, userAddresses } from "@/lib/data";
import { addOrder } from "@/lib/contexts/auth-context-server";

type FormState = {
  success: boolean;
  error?: string | null;
  orderId?: string | null;
};

// A mock function to simulate payment processing
const processPayment = (
  values: z.infer<typeof checkoutSchema>
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a validation error
      if (values.cardNumber.startsWith("4111")) {
        resolve({ success: false, error: "Invalid credit card number." });
      } else {
        resolve({ success: true });
      }
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
    const cartItems: CartItem[] = JSON.parse(cartCookie.value);
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    let shippingAddress: Address;
    if (validatedData.data.shippingAddress === 'new') {
        shippingAddress = {
            id: `addr${Date.now()}`,
            ...validatedData.data.newAddress!,
            isDefault: false,
        };
    } else {
        shippingAddress = userAddresses.find(a => a.id === validatedData.data.shippingAddress)!;
    }


    const order: Order = {
      id: `order${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
      items: cartItems,
      total: total,
      shippingAddress: shippingAddress,
    };
    
    // Add order to the "database" (in this case, server-side context)
    addOrder(order);
    
    cookies().set("cartItems", "[]"); // Clear cart cookie

    return { success: true, orderId: order.id };

  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
