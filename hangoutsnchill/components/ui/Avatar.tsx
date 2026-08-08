type AvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

export default function Avatar({
  name,
  image,
  size = "md",
}: AvatarProps) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl",
  };

  const initials = name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]}
        flex
        items-center
        justify-center
        rounded-full
        bg-blue-600
        font-bold
        text-white
      `}
    >
      {initials}
    </div>
  );
}