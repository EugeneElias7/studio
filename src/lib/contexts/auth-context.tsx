
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Auth, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser, Order, UserProfile, Address } from "@/lib/types";

interface AuthContextType {
  user: AppUser;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'userId'>) => Promise<Order | null>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<AppUser> => {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const ordersQuery = query(collection(db, "orders"), where("userId", "==", firebaseUser.uid));
      
      const [userDocSnap, ordersSnap] = await Promise.all([
          getDoc(userDocRef),
          getDocs(ordersQuery)
      ]);

      let userProfile: UserProfile;
      if (userDocSnap.exists()) {
          userProfile = userDocSnap.data() as UserProfile;
      } else {
          // This case can happen for a new Google sign-in user,
          // or if document creation failed during email signup.
           userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'New User',
              addresses: [],
          };
          // Create the document because it doesn't exist.
          await setDoc(userDocRef, userProfile);
      }

      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      return { ...userProfile, orders };
  }, []);

  const refreshUserData = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        setLoading(true);
        try {
            const userData = await fetchUserData(firebaseUser);
            setUser(userData);
        } catch (error) {
            console.error("Error refreshing user data:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    // Auth state change will trigger user data fetching
  };
  
  const signup = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { uid } = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile: UserProfile = {
        uid,
        email,
        displayName: name,
        addresses: [],
    };
    await setDoc(doc(db, "users", uid), userProfile);
    // Auth state will change, triggering a fetch of the new user's data.
    // No need to set user state manually here.
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Auth state change will trigger re-fetch of all user data and profile creation if needed.
  };


  const logout = async () => {
    await signOut(auth);
  };
  
  const addOrder = async (orderData: Omit<Order, 'id' | 'userId'>): Promise<Order | null> => {
      if (!user) {
          throw new Error("User must be logged in to place an order.");
      }
      const newOrder: Omit<Order, 'id'> = {
          ...orderData,
          userId: user.uid,
      };
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const createdOrder: Order = { ...newOrder, id: docRef.id };

      // Update local user state
      setUser(currentUser => currentUser ? { ...currentUser, orders: [...currentUser.orders, createdOrder]} : null);

      return createdOrder;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder, signInWithGoogle, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
