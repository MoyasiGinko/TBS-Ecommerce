"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BlogRow, SaveAction } from "./types";
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

interface BlogsTabProps {
  blogs: BlogRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const BlogsTab = ({
  blogs,
  isSaving,
  supabase,
  saveAction,
}: BlogsTabProps) => {
  const [newBlog, setNewBlog] = useState({
    title: "",
    date: "",
    views: 0,
    img: "",
  });
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

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Blogs</h3>
      <p className="text-sm text-dark-4 mb-4">
        {blogs.length} blog post{blogs.length === 1 ? "" : "s"}
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
        <p className="text-sm font-medium text-dark">Add New Blog Post</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-dark">
              Title <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Top 10 Fashion Trends of 2026"
              value={newBlog.title}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Date Label <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. March 13, 2026"
              value={newBlog.date}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, date: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">Views</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              placeholder="e.g. 1200"
              value={newBlog.views || ""}
              onChange={(e) =>
                setNewBlog((v) => ({
                  ...v,
                  views: Math.max(0, Number(e.target.value)),
                }))
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-dark">
              Image URL <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. /images/blog/post-1.jpg"
              value={newBlog.img}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, img: e.target.value }))
              }
            />
          </div>
        </div>
        {newBlog.img && (
          <div className="rounded-lg border border-gray-3 bg-gray-2 p-3 overflow-hidden max-h-40">
            <p className="text-xs text-dark-4 mb-2 font-medium">
              Image Preview:
            </p>
            <Image
              src={newBlog.img}
              alt="Blog preview"
              width={200}
              height={140}
              className="h-32 w-full object-cover rounded"
            />
          </div>
        )}
        <button
          disabled={isSaving}
          className={primaryBtnClass}
          onClick={() => {
            setAddStatus(null);
            if (!newBlog.title.trim()) {
              setAddStatus({ type: "error", msg: "Blog title is required." });
              return;
            }
            if (!newBlog.date.trim()) {
              setAddStatus({
                type: "error",
                msg: "Date label is required.",
              });
              return;
            }
            if (!newBlog.img.trim()) {
              setAddStatus({ type: "error", msg: "Image URL is required." });
              return;
            }
            const duplicate = blogs.find(
              (b) =>
                b.title.trim().toLowerCase() ===
                newBlog.title.trim().toLowerCase(),
            );
            if (duplicate) {
              setAddStatus({
                type: "error",
                msg: `Blog post "${duplicate.title}" already exists.`,
              });
              return;
            }
            saveAction(async () => {
              if (!supabase) return;
              const { error } = await supabase.from("blogs").insert(newBlog);
              if (error) throw error;
              setNewBlog({ title: "", date: "", views: 0, img: "" });
              setAddStatus({
                type: "success",
                msg: "Blog post added successfully!",
              });
            });
          }}
        >
          {isSaving ? "Saving…" : "Add Blog Post"}
        </button>
      </div>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search blog posts…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* List */}
      <div className="space-y-2">
        {pageItems.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4"
          >
            {editingId === `blog-${b.id}` ? (
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
                  <div className="space-y-1 md:col-span-2">
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
                      Date Label <span className="text-red">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.date || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">Views</label>
                    <input
                      className={inputClass}
                      type="number"
                      value={editingDraft.views ?? 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          views: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
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
                  <div className="rounded-lg border border-gray-3 bg-gray-2 p-3 overflow-hidden max-h-40">
                    <p className="text-xs text-dark-4 mb-2 font-medium">
                      Image Preview:
                    </p>
                    <Image
                      src={editingDraft.img}
                      alt="Blog preview"
                      width={200}
                      height={140}
                      className="h-32 w-full object-cover rounded"
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
                      if (!editingDraft.date.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Date label is required.",
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
                          .from("blogs")
                          .update({
                            title: editingDraft.title,
                            date: editingDraft.date,
                            views: editingDraft.views,
                            img: editingDraft.img,
                          })
                          .eq("id", b.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Blog post updated successfully!",
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
                  {b.img && (
                    <Image
                      src={b.img}
                      alt={b.title}
                      width={80}
                      height={56}
                      className="h-14 w-20 rounded-lg border border-gray-3 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-dark">{b.title}</p>
                    <p className="text-xs text-dark-4 mt-0.5">
                      {b.date} · {b.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={primaryBtnClass}
                    onClick={() => startEdit(`blog-${b.id}`, b)}
                  >
                    Edit
                  </button>
                  {pendingDelete === `blog-${b.id}` ? (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => {
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("blogs")
                              .delete()
                              .eq("id", b.id);
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
                      onClick={() => setPendingDelete(`blog-${b.id}`)}
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
            No blog posts found.
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
