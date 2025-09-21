
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
           userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || 'New User',
              addresses: [],
          };
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
            // Don't nullify user on refresh failure, might be temporary network issue
        } finally {
            setLoading(false);
        }
    }
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!user || user.uid !== firebaseUser.uid) { // Fetch only if user is new or changed
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
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = async (name: string, email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const { uid } = userCredential.user;
    
    const userProfile: UserProfile = {
        uid,
        email,
        displayName: name,
        addresses: [],
    };
    await setDoc(doc(db, "users", uid), userProfile);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, signInWithGoogle, refreshUserData }}>
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
