import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-300">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-slate-700/50 border rounded-lg px-3 py-2 text-slate-100
            placeholder-slate-500 text-sm
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-600 focus:ring-emerald-500'
            }
            ${className}
          `}
          {...props}
        />
        {helpText && !error && (
          <p className="text-xs text-slate-500">{helpText}</p>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
