'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: User | null;
    userRole: 'user' | 'admin' | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    userProfile: null,
    userRole: null,
    loading: true,
    logout: async () => {},
    refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const fetchUserProfile = async (user: FirebaseUser) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const profile = userDoc.data() as User;

            if (profile.suspended) {
                await signOut(auth);

                setCurrentUser(null);
                setUserProfile(null);
                setUserRole(null);
                setLoading(false);

                router.push('/login?error=suspended');
                return false;
            }

            setUserProfile(profile);
            setUserRole(profile.role);

            return true;
        }

        return false;
    };

    const refreshProfile = async () => {
        if (currentUser) {
            await fetchUserProfile(currentUser);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    await fetchUserProfile(user);
                } else {
                    setCurrentUser(null);
                    setUserProfile(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                userProfile,
                userRole,
                loading,
                logout,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
