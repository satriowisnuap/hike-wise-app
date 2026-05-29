'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, ShieldCheck, Leaf, User as UserIcon } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Beranda', href: '/user/dashboard', icon: Home },
  { label: 'Rencanakan', href: '/user/planner', icon: Map },
  { label: 'Safety', href: '/user/safety-checker', icon: ShieldCheck },
  { label: 'Eco', href: '/user/eco-tracker', icon: Leaf },
  { label: 'Profil', href: '/user/profile', icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 pb-safe z-50 transition-colors">
      <nav className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
