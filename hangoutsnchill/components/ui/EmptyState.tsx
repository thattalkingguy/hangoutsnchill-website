import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
};

export default function EmptyState({
  title,
  description,
  buttonText,
  buttonHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">

      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-5xl">
        📭
      </div>

      <h2 className="text-3xl font-bold">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-gray-500">
        {description}
      </p>

      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          {buttonText}
        </Link>
      )}

    </div>
  );
}