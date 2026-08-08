"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  full_name: string;
  username: string;
  role: string;
  wallet_balance: number;
  created_at: string;
  is_active?: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(
    id: string,
    role: "admin" | "member"
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  }

  async function toggleStatus(
    id: string,
    active: boolean
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: !active,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  }

  const filtered = users.filter((user) =>
    `${user.full_name} ${user.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="mb-8 text-4xl font-bold">
          User Management
        </h1>

        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-8 w-full rounded-lg border p-4"
        />

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading users...
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Username</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Wallet</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>

              </thead>

              <tbody>

                {filtered.map((user) => (

                  <tr
                    key={user.id}
                    className="border-t"
                  >

                    <td className="p-4 font-semibold">
                      {user.full_name}
                    </td>

                    <td className="p-4">
                      {user.username}
                    </td>

                    <td className="p-4">
                      {user.role}
                    </td>

                    <td className="p-4">
                      ₦{user.wallet_balance ?? 0}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          user.is_active === false
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.is_active === false
                          ? "Suspended"
                          : "Active"}
                      </span>
                    </td>

                    <td className="space-x-2 p-4">

                      <button
                        onClick={() =>
                          updateRole(
                            user.id,
                            user.role === "admin"
                              ? "member"
                              : "admin"
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        {user.role === "admin"
                          ? "Make Member"
                          : "Make Admin"}
                      </button>

                      <button
                        onClick={() =>
                          toggleStatus(
                            user.id,
                            user.is_active ?? true
                          )
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                      >
                        {user.is_active === false
                          ? "Activate"
                          : "Suspend"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}