import Link from 'next/link';
import { Trees, Shield, FileText, Copyright } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-lg font-bold text-stone-900 dark:text-stone-100">Hike Wise</span>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-6 text-sm font-medium text-stone-500 dark:text-stone-400">
                        <Link
                            href="/privacy"
                            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            Kebijakan Privasi
                        </Link>
                        <Link
                            href="/terms"
                            className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Syarat &amp; Ketentuan
                        </Link>
                        <span className="flex items-center gap-1.5">
                            <Copyright className="w-4 h-4" />
                            2026 Hike Wise
                        </span>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

