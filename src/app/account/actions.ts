'use server';

import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const updateProfileSchema = z.object({
  uid: z.string().min(1),
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

type FormState = {
  success: boolean;
  message?: string;
};

export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  if (!formData) {
    return { success: false, message: 'Invalid form data.' };
  }
  
  const validatedFields = updateProfileSchema.safeParse({
    uid: formData.get('uid'),
    displayName: formData.get('displayName'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.displayName?.[0] || 'Validation failed.',
    };
  }

  const { uid, displayName } = validatedFields.data;

  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      displayName: displayName,
    });
    
    // Revalidate the account page to show the new name
    revalidatePath('/account');

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
