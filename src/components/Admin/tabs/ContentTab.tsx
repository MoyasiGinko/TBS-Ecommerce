"use client";

import React, { useState } from "react";
import { SiteContentRow, ContentField, SaveAction } from "./types";
import {
  inputClass,
  sectionCardClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "./constants";
import { paginate, makeId, toContentFields, toContentPayload } from "./utils";
import { Pager } from "./Pager";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

interface ContentTabProps {
  siteContents: SiteContentRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const ContentTab = ({
  siteContents,
  isSaving,
  supabase,
  saveAction,
}: ContentTabProps) => {
  const [newContent, setNewContent] = useState({
    key: "",
    title: "",
    fields: [{ id: makeId(), key: "", value: "" }] as ContentField[],
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
    setEditingDraft({
      ...row,
      fields: toContentFields(row.content),
    });
    setEditStatus(null);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDraft({});
  };

  const filtered = siteContents.filter((c) =>
    (c.key + c.title + JSON.stringify(c.content || {}))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Site Content</h3>
      <p className="text-sm text-dark-4 mb-4">
        {siteContents.length} content block
        {siteContents.length === 1 ? "" : "s"}
      </p>

      {/* Add form */}
      <div className="rounded-xl border border-gray-3 bg-gray-1/50 p-4 mb-4 space-y-3">
        <p className="text-sm font-medium text-dark">Add New Content Block</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">Key</label>
            <input
              className={inputClass}
              placeholder="e.g. home.hero_main"
              value={newContent.key}
              onChange={(e) =>
                setNewContent((v) => ({ ...v, key: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">Title</label>
            <input
              className={inputClass}
              placeholder="e.g. Homepage Hero Section"
              value={newContent.title}
              onChange={(e) =>
                setNewContent((v) => ({ ...v, title: e.target.value }))
              }
            />
          </div>

          {/* Dynamic fields */}
          <div className="md:col-span-2 space-y-2 rounded-xl border border-gray-3 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-dark-4">
              Content Fields
            </p>
            {newContent.fields.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2"
              >
                <div className="space-y-1">
                  <label className="block text-xs text-dark-4">Field Key</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. headline"
                    value={field.key}
                    onChange={(e) =>
                      setNewContent((v) => ({
                        ...v,
                        fields: v.fields.map((item) =>
                          item.id === field.id
                            ? { ...item, key: e.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-dark-4">Value</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Shop the Latest Trends"
                    value={field.value}
                    onChange={(e) =>
                      setNewContent((v) => ({
                        ...v,
                        fields: v.fields.map((item) =>
                          item.id === field.id
                            ? { ...item, value: e.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  className="self-end inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white"
                  disabled={newContent.fields.length <= 1}
                  onClick={() =>
                    setNewContent((v) => ({
                      ...v,
                      fields:
                        v.fields.length > 1
                          ? v.fields.filter((item) => item.id !== field.id)
                          : v.fields,
                    }))
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() =>
                setNewContent((v) => ({
                  ...v,
                  fields: [...v.fields, { id: makeId(), key: "", value: "" }],
                }))
              }
            >
              + Add Field
            </button>
          </div>
        </div>
        <button
          disabled={isSaving}
          className={primaryBtnClass}
          onClick={() => {
            if (!newContent.key.trim()) {
              setAddStatus({ type: "error", msg: "Content key is required." });
              return;
            }
            if (!newContent.title.trim()) {
              setAddStatus({
                type: "error",
                msg: "Content title is required.",
              });
              return;
            }
            saveAction(async () => {
              if (!supabase) return;
              const { error } = await supabase.from("site_content").insert({
                key: newContent.key,
                title: newContent.title,
                content: toContentPayload(newContent.fields),
              });
              if (error) throw error;
              setAddStatus({
                type: "success",
                msg: "Content block added successfully!",
              });
              setNewContent({
                key: "",
                title: "",
                fields: [{ id: makeId(), key: "", value: "" }],
              });
            });
          }}
        >
          {isSaving ? "Saving…" : "Add Content Block"}
        </button>
      </div>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search site content…"
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
            {editingId === `content-${c.id}` ? (
              <div className="space-y-3">
                {editStatus && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                      editStatus.type === "success"
                        ? "border-green/30 bg-green/10 text-green"
                        : "border-red/30 bg-red/10 text-red"
                    }`}
                  >
                    {editStatus.msg}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">Title</label>
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

                  <div className="space-y-2 rounded-xl border border-gray-3 bg-gray-1/50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-dark-4">
                      Content Fields
                    </p>
                    {(editingDraft.fields || []).map((field: ContentField) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2"
                      >
                        <div className="space-y-1">
                          <label className="block text-xs text-dark-4">
                            Field Key
                          </label>
                          <input
                            className={inputClass}
                            placeholder="key"
                            value={field.key}
                            onChange={(e) =>
                              setEditingDraft((d) => ({
                                ...d,
                                fields: (d.fields || []).map(
                                  (item: ContentField) =>
                                    item.id === field.id
                                      ? { ...item, key: e.target.value }
                                      : item,
                                ),
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs text-dark-4">
                            Value
                          </label>
                          <input
                            className={inputClass}
                            placeholder="value"
                            value={field.value}
                            onChange={(e) =>
                              setEditingDraft((d) => ({
                                ...d,
                                fields: (d.fields || []).map(
                                  (item: ContentField) =>
                                    item.id === field.id
                                      ? { ...item, value: e.target.value }
                                      : item,
                                ),
                              }))
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="self-end inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white"
                          disabled={(editingDraft.fields || []).length <= 1}
                          onClick={() =>
                            setEditingDraft((d) => ({
                              ...d,
                              fields:
                                (d.fields || []).length > 1
                                  ? (d.fields || []).filter(
                                      (item: ContentField) =>
                                        item.id !== field.id,
                                    )
                                  : d.fields,
                            }))
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={secondaryBtnClass}
                      onClick={() =>
                        setEditingDraft((d) => ({
                          ...d,
                          fields: [
                            ...(d.fields || []),
                            { id: makeId(), key: "", value: "" },
                          ],
                        }))
                      }
                    >
                      + Add Field
                    </button>
                  </div>
                </div>{" "}
                <div className="flex gap-2">
                  <button
                    className={primaryBtnClass}
                    disabled={isSaving}
                    onClick={() => {
                      if (!editingDraft.title.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Content title is required.",
                        });
                        return;
                      }
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("site_content")
                          .update({
                            title: editingDraft.title,
                            content: toContentPayload(
                              editingDraft.fields || [],
                            ),
                          })
                          .eq("id", c.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Content block updated successfully!",
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
                  <p className="font-medium text-dark">{c.title}</p>
                  <p className="text-xs text-dark-4 mb-2">{c.key}</p>
                  <pre className="text-xs bg-gray-1 rounded p-2 overflow-x-auto max-h-[120px]">
                    {JSON.stringify(c.content || {}, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className={primaryBtnClass}
                    onClick={() => startEdit(`content-${c.id}`, c)}
                  >
                    Edit
                  </button>
                  {pendingDelete === `content-${c.id}` ? (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => {
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("site_content")
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
                      onClick={() => setPendingDelete(`content-${c.id}`)}
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
            No content blocks found.
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
