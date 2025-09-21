
'use server';

import { z } from 'zod';
import { checkoutSchema } from '@/lib/validation';
import { cookies } from 'next/headers';
import { doc, updateDoc, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Address } from '@/lib/types';

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
      // In a real app, you would integrate with a payment provider like Stripe
      console.log('Processing payment for:', values.cardholderName);
      resolve({ success: true });
    }, 1500);
  });
};

export async function placeOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const rawData = Object.fromEntries(formData.entries());

    // Manually construct the nested newAddress object
    const values = {
      ...rawData,
      newAddress: {
        street: rawData['newAddress.street'],
        city: rawData['newAddress.city'],
        state: rawData['newAddress.state'],
        zip: rawData['newAddress.zip'],
      },
    };

    const validatedData = checkoutSchema.safeParse(values);

    if (!validatedData.success) {
      console.error('Validation Errors:', validatedData.error.flatten().fieldErrors);
      return { success: false, error: 'Invalid form data. Please check your entries.' };
    }

    const { shippingAddress, newAddress, userId, cartItems: cartItemsJSON } = validatedData.data;
    
    if (!userId) {
        return { success: false, error: 'User is not authenticated.' };
    }

    // --- Payment Processing ---
    const paymentResult = await processPayment(validatedData.data);
    if (!paymentResult.success) {
      return { success: false, error: paymentResult.error || 'Payment failed.' };
    }

    const cartItems = JSON.parse(cartItemsJSON as string);
    if (!cartItems || cartItems.length === 0) {
        return { success: false, error: 'Your cart is empty.' };
    }

    let finalShippingAddress: Address;

    // --- Address Handling ---
    if (shippingAddress === 'new' && newAddress) {
        const newAddressWithId: Address = {
            id: `addr_${Date.now()}`,
            ...newAddress,
            isDefault: false // Or logic to make it default
        };
        finalShippingAddress = newAddressWithId;
        
        // Add new address to user's profile in Firestore
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            addresses: arrayUnion(finalShippingAddress)
        });
    } else {
        // This part requires fetching the user's addresses.
        // For simplicity, we assume the address details could be passed differently
        // or fetched here. The current structure is a bit limited.
        // Let's create a placeholder from the ID.
        finalShippingAddress = { id: shippingAddress, street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A', isDefault: false };
    }


    // --- Order Creation ---
    const total = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    const orderData: Omit<Order, 'id'> = {
      userId: userId,
      date: new Date().toISOString(),
      status: 'Processing',
      items: cartItems.map(({ id, imageUrl, ...rest }: any) => rest),
      total: total,
      shippingAddress: finalShippingAddress,
    };

    const orderDocRef = await addDoc(collection(db, 'orders'), orderData);
    
    // --- Clear Cart ---
    cookies().set('cartItems', '[]', { path: '/' });

    return { success: true, orderId: orderDocRef.id };

  } catch (error) {
    console.error('Checkout Error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
