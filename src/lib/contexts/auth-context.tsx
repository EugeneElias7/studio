
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Auth, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser, Order, UserProfile, Address } from "@/lib/types";

interface AuthContextType {
  user: AppUser;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'userId'>) => Promise<Order | null>;
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
          // This case happens on initial signup if the doc isn't created yet.
           userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'New User',
              addresses: [],
          };
      }

      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      return { ...userProfile, orders };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
        setLoading(false);
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
    setUser({ ...userProfile, orders: [] });
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
    <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder }}>
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
