'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AVATAR_COLORS = [
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
];

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  const getInitials = (str: string) => {
    const words = str.trim().split(/\s+/);
    if (words.length === 0) return 'U';
    const initials = words.slice(0, 2).map((w) => w[0].toUpperCase());
    return initials.join('');
  };

  const getColor = (str: string) => {
    if (!str) return AVATAR_COLORS[0];
    const index = str.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const initials = getInitials(name);
  const color = getColor(name);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        color.bg,
        color.text,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
