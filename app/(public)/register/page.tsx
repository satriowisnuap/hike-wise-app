'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Trees } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Password tidak cocok');
            return;
        }
        if (name.trim().split(' ').length < 2) {
            toast.error('Gunakan nama lengkap (minimal 2 kata)');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user',
                ecoScore: 0,
                totalTrips: 0,
                suspended: false,
                createdAt: Timestamp.now(),
            });

            toast.success('Pendaftaran berhasil!');
            router.push('/user/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Gagal mendaftar');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName || 'Pendaki Baru',
                    email: user.email || '',
                    role: 'user',
                    ecoScore: 0,
                    totalTrips: 0,
                    suspended: false,
                    createdAt: Timestamp.now(),
                });
            }
            toast.success('Berhasil masuk dengan Google');
            router.push('/user/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Gagal masuk dengan Google');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 md:bg-stone-100 dark:bg-stone-950 px-4 py-12 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-stone-900 md:rounded-2xl md:shadow-lg md:border border-stone-200 dark:border-stone-700 p-8">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-2">
                            <Trees className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hike Wise</span>
                        </div>
                    </Link>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Daftar Akun Baru</h2>
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                        Mulai petualangan cerdasmu bersama kami
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Budi Santoso"
                            className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-stone-900 dark:text-stone-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@contoh.com"
                            className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-stone-900 dark:text-stone-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Kata Sandi
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-stone-900 dark:text-stone-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
                            Konfirmasi Kata Sandi
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi kata sandi"
                            className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-stone-900 dark:text-stone-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="mt-6 flex items-center">
                    <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                    <span className="px-3 text-sm text-stone-500 dark:text-stone-400">Atau daftar dengan</span>
                    <div className="flex-grow border-t border-stone-200 dark:border-stone-700"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="mt-6 w-full flex justify-center items-center gap-2 py-3 px-4 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-medium rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>

                <p className="mt-8 text-center text-sm text-stone-600 dark:text-stone-400">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
