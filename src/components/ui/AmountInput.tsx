import { useState, forwardRef } from 'react';

interface AmountInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function AmountInput({ label, value, onChange, error, required, placeholder = '0,00' }: AmountInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, comma, and period
    const raw = e.target.value.replace(/[^0-9.,]/g, '');
    onChange(raw);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className={`
        flex items-center bg-slate-700/50 border rounded-lg px-3 py-2 gap-2
        ${focused ? 'ring-2 ring-emerald-500 border-transparent' : error ? 'border-red-500' : 'border-slate-600'}
      `}>
        <span className="text-slate-400 text-sm font-medium">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
