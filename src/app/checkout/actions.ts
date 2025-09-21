
'use server';

import { z } from 'zod';
import { checkoutSchema } from '@/lib/validation';
import { cookies } from 'next/headers';
import { doc, updateDoc, addDoc, collection, arrayUnion, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Address, UserProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type FormState = {
  success: boolean;
  error?: string | null;
  orderId?: string | null;
};

// A mock function to simulate payment processing
const processPayment = (
  values: any
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, you would integrate with a payment provider like Stripe
      console.log('Processing payment for:', values.cardholderName);
      if (!values.cardholderName || !values.cardNumber) {
          resolve({ success: false, error: 'Invalid card details.'});
          return;
      }
      resolve({ success: true });
    }, 1500);
  });
};

export async function placeOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData);
  
  // Manually construct the data object for validation
  const validationData = {
    ...rawData,
    newAddress: {
      street: rawData.newAddressStreet,
      city: rawData.newAddressCity,
      state: rawData.newAddressState,
      zip: rawData.newAddressZip,
    },
  };

  try {
    const validatedData = checkoutSchema.safeParse(validationData);

    if (!validatedData.success) {
      console.error('Validation Errors:', validatedData.error.flatten().fieldErrors);
      const firstError = Object.values(validatedData.error.flatten().fieldErrors)[0]?.[0] 
                       || Object.values(validatedData.error.flatten().formErrors)[0];
      return { success: false, error: firstError || 'Invalid form data. Please check your entries.' };
    }

    const { shippingAddress, newAddress, userId, cartItems: cartItemsJSON, paymentMethod } = validatedData.data;
    
    if (!userId) {
        return { success: false, error: 'User is not authenticated.' };
    }

    // --- Payment Processing ---
    if (paymentMethod === 'creditCard') {
      const paymentResult = await processPayment(validatedData.data);
      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error || 'Payment failed.' };
      }
    }

    const cartItems = JSON.parse(cartItemsJSON as string);
    if (!cartItems || cartItems.length === 0) {
        return { success: false, error: 'Your cart is empty.' };
    }

    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        return { success: false, error: 'User profile not found.' };
    }
    const userProfile = userDocSnap.data() as UserProfile;

    let finalShippingAddress: Address;

    // --- Address Handling ---
    if (shippingAddress === 'new' && newAddress) {
        const newAddressWithId: Address = {
            id: `addr_${Date.now()}`,
            ...newAddress,
            isDefault: false 
        };
        finalShippingAddress = newAddressWithId;
    } else {
        const selectedAddress = userProfile.addresses.find(addr => addr.id === shippingAddress);
        if (!selectedAddress) {
            return { success: false, error: 'Selected shipping address not found.'};
        }
        finalShippingAddress = selectedAddress;
    }


    // --- Order Creation ---
    const total = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    const orderData: Omit<Order, 'id'> = {
      userId: userId,
      date: new Date().toISOString(),
      status: 'Processing',
      items: cartItems.map(({ id, imageUrl, ...rest }: any) => rest), // Remove id and imageUrl from items
      total: total,
      shippingAddress: finalShippingAddress,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card',
    };

    const batch = writeBatch(db);

    // 1. Add the new order
    const orderDocRef = doc(collection(db, 'orders'));
    batch.set(orderDocRef, orderData);
    
    // 2. Add new address to user's profile if applicable
    if (shippingAddress === 'new') {
        batch.update(userDocRef, {
            addresses: arrayUnion(finalShippingAddress)
        });
    }

    await batch.commit();
    
    // --- Clear Cart ---
    cookies().set('cartItems', '[]', { maxAge: -1, path: '/' });

    // Revalidate paths to reflect changes
    revalidatePath('/checkout');
    revalidatePath('/account/orders');
    revalidatePath('/account');


    return { success: true, orderId: orderDocRef.id };

  } catch (error) {
    console.error('Checkout Error:', error);
    // Be careful not to expose sensitive error details to the client
    if (error instanceof z.ZodError) {
        return { success: false, error: 'Validation failed on the server.'}
    }
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

    