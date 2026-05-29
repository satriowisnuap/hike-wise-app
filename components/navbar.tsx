'use client';

import Link from 'next/link';
import { Trees, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

interface NavbarProps {
    currentUser: unknown;
}

export default function Navbar({ currentUser }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-700 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Trees className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hike Wise</span>
                    </div>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a
                            href="#fitur"
                            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
                        >
                            Fitur
                        </a>
                        <a
                            href="#cara-kerja"
                            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
                        >
                            Cara Kerja
                        </a>
                        <a
                            href="#komunitas"
                            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
                        >
                            Komunitas
                        </a>
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            href={currentUser ? '/user/dashboard' : '/login'}
                            className="px-4 py-2 text-sm font-medium rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950 dark:hover:bg-emerald-900 transition-colors"
                        >
                            {currentUser ? 'Dashboard' : 'Masuk'}
                        </Link>
                        {!currentUser && (
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm"
                            >
                                Daftar Gratis
                            </Link>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center gap-2 sm:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-4 flex flex-col gap-3">
                    <a
                        href="#fitur"
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        Fitur
                    </a>
                    <a
                        href="#cara-kerja"
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        Cara Kerja
                    </a>
                    <a
                        href="#komunitas"
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        Komunitas
                    </a>
                    <hr className="border-stone-200 dark:border-stone-700" />
                    <Link
                        href={currentUser ? '/user/dashboard' : '/login'}
                        className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
                    >
                        {currentUser ? 'Dashboard' : 'Masuk'}
                    </Link>
                    {!currentUser && (
                        <Link
                            href="/register"
                            className="px-4 py-2 text-sm font-bold rounded-xl text-center text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                        >
                            Daftar Gratis
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
