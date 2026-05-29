'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  userRole: 'user' | 'admin' | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  userRole: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profile = userDoc.data() as User;
            if (profile.suspended) {
              await signOut(auth);
              setCurrentUser(null);
              setUserProfile(null);
              setUserRole(null);
              router.push('/login?error=suspended');
            } else {
              setUserProfile(profile);
              setUserRole(profile.role);
            }
          } else {
            // Create new user profile for Google Sign-In
            const newProfile: User = {
              uid: user.uid,
              name: user.displayName || 'Pendaki Baru',
              email: user.email || '',
              role: 'user',
              ecoScore: 0,
              totalTrips: 0,
              suspended: false,
              createdAt: Timestamp.now(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setUserRole('user');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
