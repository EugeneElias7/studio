'use server';

import { z } from 'zod';
import { checkoutSchema } from '@/lib/validation';
import { cookies } from 'next/headers';
import { doc, getDoc, writeBatch, collection } from 'firebase/firestore';
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
  values: z.infer<typeof checkoutSchema>
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Processing payment for:', values.cardholderName);
      // Simulate a successful payment
      resolve({ success: true });
    }, 1000);
  });
};

export async function placeOrder(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData);
  
  // Manually construct the nested object for validation from the flat FormData
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
      // Return the first validation error found
      const firstError = Object.values(validatedData.error.flatten().fieldErrors)[0]?.[0];
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
        return { success: false, error: paymentResult.error || 'Payment failed. Please check your card details.' };
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
    let shouldAddNewAddress = false;

    // --- Address Handling ---
    if (shippingAddress === 'new' && newAddress?.street) {
        const newAddressWithId: Address = {
            id: `addr_${Date.now()}`,
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            zip: newAddress.zip,
            isDefault: false 
        };
        finalShippingAddress = newAddressWithId;
        shouldAddNewAddress = true;
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
      items: cartItems.map(({ id, imageUrl, ...rest }: any) => rest), // Remove image-specific data
      total: total,
      shippingAddress: finalShippingAddress,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card',
    };

    const batch = writeBatch(db);

    // 1. Add the new order
    const orderDocRef = doc(collection(db, 'orders'));
    batch.set(orderDocRef, orderData);
    
    // 2. Add new address to user's profile if applicable
    if (shouldAddNewAddress) {
        const existingAddresses = userProfile.addresses || [];
        batch.update(userDocRef, {
            addresses: [...existingAddresses, finalShippingAddress]
        });
    }

    await batch.commit();
    
    // --- Clear Cart ---
    cookies().set('cartItems', '[]', { httpOnly: true, path: '/', maxAge: -1 });

    // Revalidate paths to reflect changes
    revalidatePath('/account');
    revalidatePath('/account/orders');

    return { success: true, orderId: orderDocRef.id };

  } catch (error) {
    console.error('Checkout Error:', error);
    if (error instanceof z.ZodError) {
        return { success: false, error: 'Validation failed on the server.'}
    }
    // Check for Firebase permissions error
    if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        return { success: false, error: 'Permission denied. Please check Firestore security rules.' };
    }
    return { success: false, error: 'An unexpected error occurred during order placement. Please try again.' };
  }
}
