import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
};

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white
        shadow-sm
        border
        border-gray-100
        overflow-hidden
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="border-b border-gray-100 px-6 py-5">
          {title && (
            <h2 className="text-xl font-bold">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>

      {footer && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}