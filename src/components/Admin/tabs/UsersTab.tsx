"use client";

import React, { useState } from "react";
import { SaveAction } from "./types";
import { inputClass, sectionCardClass } from "./constants";
import { paginate } from "./utils";
import { Pager } from "./Pager";
import { UserProfile } from "@/types/user";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

const ROLE_OPTIONS = ["customer", "manager", "admin"] as const;

interface UsersTabProps {
  users: UserProfile[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const UsersTab = ({
  users,
  isSaving,
  supabase,
  saveAction,
}: UsersTabProps) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = users.filter((u) =>
    (u.email + (u.fullName ?? "") + u.role)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Users</h3>
      <p className="text-sm text-dark-4 mb-4">
        {users.length} user{users.length === 1 ? "" : "s"} — roles managed here;
        accounts created via sign-up
      </p>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search by name, email, or role…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* List */}
      <div className="space-y-2">
        {pageItems.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-dark truncate">
                {u.fullName || "Unnamed"}
              </p>
              <p className="text-sm text-dark-4 truncate">{u.email}</p>
              {u.createdAt && (
                <p className="text-xs text-dark-4 mt-0.5">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-dark-4">Role:</label>
              <select
                className="rounded-lg border border-gray-3 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-blue"
                value={u.role}
                disabled={isSaving}
                onChange={(e) => {
                  saveAction(async () => {
                    if (!supabase) return;
                    const { error } = await supabase
                      .from("profiles")
                      .update({ role: e.target.value })
                      .eq("id", u.id);
                    if (error) throw error;
                  });
                }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!pageItems.length && (
          <p className="text-sm text-dark-4 py-4 text-center">
            No users found.
          </p>
        )}
      </div>

      <Pager
        totalPages={totalPages}
        currentPage={safePage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
