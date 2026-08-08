type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-gray-900">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}