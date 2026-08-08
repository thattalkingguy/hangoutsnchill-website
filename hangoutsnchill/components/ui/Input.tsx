import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">

        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}

        <input
          ref={ref}
          {...props}
          className={`
            w-full
            rounded-xl
            border
            border-gray-300
            bg-white
            px-4
            py-3
            outline-none
            transition
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-200
            disabled:bg-gray-100
            disabled:cursor-not-allowed
            ${className}
          `}
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;