import Card from "@/components/ui/Card";

type StatCardProps = {
  title: string;
  value: string | number;
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
    <Card>

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>
          )}

        </div>

        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl">
            {icon}
          </div>
        )}

      </div>

    </Card>
  );
}