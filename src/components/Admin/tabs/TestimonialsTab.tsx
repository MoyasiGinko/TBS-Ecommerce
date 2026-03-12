"use client";

import React, { useState } from "react";
import { TestimonialRow, SaveAction } from "./types";
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

interface TestimonialsTabProps {
  testimonials: TestimonialRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const TestimonialsTab = ({
  testimonials,
  isSaving,
  supabase,
  saveAction,
}: TestimonialsTabProps) => {
  const [newTestimonial, setNewTestimonial] = useState({
    review: "",
    author_name: "",
    author_role: "",
    author_img: "",
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

  const filtered = testimonials.filter((t) =>
    (t.author_name + t.author_role + t.review)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Testimonials</h3>
      <p className="text-sm text-dark-4 mb-4">
        {testimonials.length} testimonial{testimonials.length === 1 ? "" : "s"}
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
        <p className="text-sm font-medium text-dark">Add New Testimonial</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-dark">
              Review Text <span className="text-red">*</span>
            </label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              placeholder="e.g. Great product, highly recommend!"
              value={newTestimonial.review}
              onChange={(e) =>
                setNewTestimonial((v) => ({ ...v, review: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Author Name <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Jane Doe"
              value={newTestimonial.author_name}
              onChange={(e) =>
                setNewTestimonial((v) => ({
                  ...v,
                  author_name: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Author Role <span className="text-red">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Verified Buyer"
              value={newTestimonial.author_role}
              onChange={(e) =>
                setNewTestimonial((v) => ({
                  ...v,
                  author_role: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-dark">
              Author Image URL
            </label>
            <input
              className={inputClass}
              placeholder="e.g. /images/users/avatar.jpg"
              value={newTestimonial.author_img}
              onChange={(e) =>
                setNewTestimonial((v) => ({
                  ...v,
                  author_img: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <button
          disabled={isSaving}
          className={primaryBtnClass}
          onClick={() => {
            setAddStatus(null);
            if (!newTestimonial.review.trim()) {
              setAddStatus({
                type: "error",
                msg: "Review text is required.",
              });
              return;
            }
            if (!newTestimonial.author_name.trim()) {
              setAddStatus({
                type: "error",
                msg: "Author name is required.",
              });
              return;
            }
            if (!newTestimonial.author_role.trim()) {
              setAddStatus({
                type: "error",
                msg: "Author role is required.",
              });
              return;
            }
            saveAction(async () => {
              if (!supabase) return;
              const { error } = await supabase
                .from("testimonials")
                .insert(newTestimonial);
              if (error) throw error;
              setNewTestimonial({
                review: "",
                author_name: "",
                author_role: "",
                author_img: "",
              });
              setAddStatus({
                type: "success",
                msg: "Testimonial added successfully!",
              });
            });
          }}
        >
          {isSaving ? "Saving…" : "Add Testimonial"}
        </button>
      </div>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search testimonials…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* List */}
      <div className="space-y-2">
        {pageItems.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4"
          >
            {editingId === `testimonial-${t.id}` ? (
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
                      Review Text
                    </label>
                    <textarea
                      className={`${inputClass} min-h-[80px]`}
                      value={editingDraft.review || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          review: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Author Name
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.author_name || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          author_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Author Role
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.author_role || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          author_role: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs text-dark-4">
                      Author Image URL
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.author_img || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          author_img: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={primaryBtnClass}
                    disabled={isSaving}
                    onClick={() => {
                      setEditStatus(null);
                      if (!editingDraft.review.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Review text is required.",
                        });
                        return;
                      }
                      if (!editingDraft.author_name.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Author name is required.",
                        });
                        return;
                      }
                      if (!editingDraft.author_role.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Author role is required.",
                        });
                        return;
                      }
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("testimonials")
                          .update({
                            review: editingDraft.review,
                            author_name: editingDraft.author_name,
                            author_role: editingDraft.author_role,
                            author_img: editingDraft.author_img,
                          })
                          .eq("id", t.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Testimonial updated successfully!",
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-dark">{t.author_name}</p>
                  <p className="text-xs text-dark-4 mb-1">{t.author_role}</p>
                  <p className="text-sm text-dark-3 line-clamp-2">{t.review}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={primaryBtnClass}
                    onClick={() => startEdit(`testimonial-${t.id}`, t)}
                  >
                    Edit
                  </button>
                  {pendingDelete === `testimonial-${t.id}` ? (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => {
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("testimonials")
                              .delete()
                              .eq("id", t.id);
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
                      onClick={() => setPendingDelete(`testimonial-${t.id}`)}
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
            No testimonials found.
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
