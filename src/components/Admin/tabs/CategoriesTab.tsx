"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CategoryRow, SaveAction } from "./types";
import {
  inputClass,
  sectionCardClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "./constants";
import { paginate } from "./utils";
import { Pager } from "./Pager";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

interface CategoriesTabProps {
  categories: CategoryRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const CategoriesTab = ({
  categories,
  isSaving,
  supabase,
  saveAction,
}: CategoriesTabProps) => {
  const [newCategory, setNewCategory] = useState({ title: "", img: "" });
  const [addStatus, setAddStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState("");
  const [editingDraft, setEditingDraft] = useState<Record<string, any>>({});
  const [editStatus, setEditStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const startEdit = (id: string, row: any) => {
    setEditingId(id);
    setEditingDraft({ ...row });
    setEditStatus(null);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDraft({});
    setEditStatus(null);
  };

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Categories</h3>
      <p className="text-sm text-dark-4 mb-4">
        {categories.length} categor{categories.length === 1 ? "y" : "ies"}
      </p>

      {/* Add status */}
      {addStatus && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            addStatus.type === "success"
              ? "border-green/30 bg-green/10 text-green"
              : "border-red/30 bg-red/10 text-red"
          }`}
        >
          {addStatus.msg}
        </div>
      )}

      {/* Add form */}
      <div className="rounded-xl border border-gray-3 bg-gray-1/50 p-4 mb-4 space-y-3">
        <p className="text-sm font-medium text-dark">Add New Category</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Title <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Electronics"
              value={newCategory.title}
              onChange={(e) =>
                setNewCategory((v) => ({ ...v, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Image URL <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. /images/categories/electronics.jpg"
              value={newCategory.img}
              onChange={(e) =>
                setNewCategory((v) => ({ ...v, img: e.target.value }))
              }
            />
          </div>
        </div>
        {newCategory.img && (
          <div className="rounded-lg border border-gray-3 bg-gray-2 p-3 overflow-hidden max-h-32">
            <p className="text-xs text-dark-4 mb-2 font-medium">
              Image Preview:
            </p>
            <Image
              src={newCategory.img}
              alt="Category preview"
              width={120}
              height={120}
              className="h-24 w-24 object-cover rounded"
            />
          </div>
        )}
        <button
          disabled={isSaving}
          className={primaryBtnClass}
          onClick={() => {
            setAddStatus(null);
            if (!newCategory.title.trim()) {
              setAddStatus({
                type: "error",
                msg: "Category title is required.",
              });
              return;
            }
            if (!newCategory.img.trim()) {
              setAddStatus({ type: "error", msg: "Image URL is required." });
              return;
            }
            const duplicate = categories.find(
              (c) =>
                c.title.trim().toLowerCase() ===
                newCategory.title.trim().toLowerCase(),
            );
            if (duplicate) {
              setAddStatus({
                type: "error",
                msg: `Category "${duplicate.title}" already exists.`,
              });
              return;
            }
            saveAction(async () => {
              if (!supabase) return;
              const { error } = await supabase
                .from("categories")
                .insert(newCategory);
              if (error) throw error;
              setNewCategory({ title: "", img: "" });
              setAddStatus({
                type: "success",
                msg: "Category added successfully!",
              });
            });
          }}
        >
          {isSaving ? "Saving…" : "Add Category"}
        </button>
      </div>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search categories…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* List */}
      <div className="space-y-2">
        {pageItems.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4"
          >
            {editingId === `category-${c.id}` ? (
              <div className="space-y-3">
                {editStatus && (
                  <div
                    className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                      editStatus.type === "success"
                        ? "border-green/30 bg-green/10 text-green"
                        : "border-red/30 bg-red/10 text-red"
                    }`}
                  >
                    {editStatus.msg}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Title <span className="text-red">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.title || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Image URL <span className="text-red">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.img || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({ ...d, img: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {editingDraft.img && (
                  <div className="rounded-lg border border-gray-3 bg-gray-2 p-3 overflow-hidden max-h-32">
                    <p className="text-xs text-dark-4 mb-2 font-medium">
                      Image Preview:
                    </p>
                    <Image
                      src={editingDraft.img}
                      alt="Category preview"
                      width={120}
                      height={120}
                      className="h-24 w-24 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    className={primaryBtnClass}
                    disabled={isSaving}
                    onClick={() => {
                      setEditStatus(null);
                      if (!editingDraft.title.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Title is required.",
                        });
                        return;
                      }
                      if (!editingDraft.img.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Image URL is required.",
                        });
                        return;
                      }
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("categories")
                          .update({
                            title: editingDraft.title,
                            img: editingDraft.img,
                          })
                          .eq("id", c.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Category updated successfully!",
                        });
                        cancelEdit();
                      });
                    }}
                  >
                    Save
                  </button>
                  <button className={secondaryBtnClass} onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {c.img && (
                    <Image
                      src={c.img}
                      alt={c.title}
                      width={60}
                      height={60}
                      className="h-14 w-14 rounded-lg border border-gray-3 object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <p className="font-medium text-dark">{c.title}</p>
                    {c.img && (
                      <p className="text-xs text-dark-4 mt-0.5 truncate max-w-xs">
                        {c.img}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={primaryBtnClass}
                    onClick={() => startEdit(`category-${c.id}`, c)}
                  >
                    Edit
                  </button>
                  {pendingDelete === `category-${c.id}` ? (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => {
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("categories")
                              .delete()
                              .eq("id", c.id);
                            if (error) throw error;
                            setPendingDelete(null);
                          });
                        }}
                      >
                        Confirm Delete
                      </button>
                      <button
                        className={secondaryBtnClass}
                        onClick={() => setPendingDelete(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                      disabled={isSaving}
                      onClick={() => setPendingDelete(`category-${c.id}`)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {!pageItems.length && (
          <p className="text-sm text-dark-4 py-4 text-center">
            No categories found.
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
