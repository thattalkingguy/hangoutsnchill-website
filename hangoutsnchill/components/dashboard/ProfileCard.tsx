"use client";

import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

type ProfileCardProps = {
  name: string;
  email: string;
};

export default function ProfileCard({
  name,
  email,
}: ProfileCardProps) {
  return (
    <Card>

      <div className="flex items-center gap-5">

        <Avatar
          name={name}
          size="lg"
        />

        <div>

          <h2 className="text-2xl font-bold">
            {name}
          </h2>

          <p className="text-gray-500">
            {email}
          </p>

        </div>

      </div>

    </Card>
  );
}