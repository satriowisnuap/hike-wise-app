import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function PasswordInput({ label, value, onChange, placeholder, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors text-stone-900 dark:text-stone-100 pr-12"
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
