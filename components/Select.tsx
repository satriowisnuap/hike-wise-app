import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps {
    options: SelectOption[];
    value: string | number;
    onChange: (value: string | number) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    icon?: LucideIcon;
}

const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder = 'Pilih...',
    disabled = false,
    className = '',
    icon: Icon,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`flex flex-col gap-1 ${className}`} ref={selectRef}>
            {label && <label className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between py-2 ${Icon ? 'pl-9' : 'pl-4'} pr-4 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-stone-400 dark:hover:border-stone-500'}`}
                >
                    {Icon && (
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    )}
                    <span className={`block truncate ${!selectedOption && placeholder ? 'text-stone-500' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <ul className="max-h-60 overflow-auto py-1">
                            {options.map((opt) => (
                                <li
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                                        value === opt.value
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'
                                    }`}
                                >
                                    <span className="block truncate">{opt.label}</span>
                                    {value === opt.value && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Select;
