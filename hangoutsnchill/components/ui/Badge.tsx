type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gray";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  children,
  variant = "gray",
}: BadgeProps) {
  const variants = {
    success:
      "bg-green-100 text-green-700",

    warning:
      "bg-yellow-100 text-yellow-700",

    danger:
      "bg-red-100 text-red-700",

    info:
      "bg-blue-100 text-blue-700",

    gray:
      "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-sm
        font-semibold
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}