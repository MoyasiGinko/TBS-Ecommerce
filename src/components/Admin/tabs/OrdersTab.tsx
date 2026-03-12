"use client";

import React, { useState } from "react";
import { OrderRow, SaveAction } from "./types";
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

const STATUS_OPTIONS: OrderRow["status"][] = [
  "processing",
  "delivered",
  "on-hold",
];

const statusBadgeClass = (status: OrderRow["status"]) => {
  if (status === "delivered")
    return "inline-flex rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green";
  if (status === "on-hold")
    return "inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600";
  return "inline-flex rounded-full bg-blue/10 px-2 py-0.5 text-xs font-medium text-blue";
};

interface OrdersTabProps {
  orders: OrderRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const OrdersTab = ({
  orders,
  isSaving,
  supabase,
  saveAction,
}: OrdersTabProps) => {
  const [newOrder, setNewOrder] = useState<Omit<OrderRow, "id">>({
    user_id: "",
    order_id: "",
    created_at_label: "",
    status: "processing",
    total: "$0",
    title: "",
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
  };

  const filtered = orders.filter((o) =>
    (o.order_id + o.title + o.status)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Orders</h3>
      <p className="text-sm text-dark-4 mb-4">
        {orders.length} order{orders.length === 1 ? "" : "s"}
      </p>

      {/* Add form */}
      <div className="rounded-xl border border-gray-3 bg-gray-1/50 p-4 mb-4 space-y-3">
        <p className="text-sm font-medium text-dark">Add New Order</p>
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
            <label className="block text-sm font-medium text-dark">
              User ID (UUID)
            </label>
            <input
              className={inputClass}
              placeholder="e.g. b3e5f1a2-…"
              value={newOrder.user_id}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, user_id: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Order Code
            </label>
            <input
              className={inputClass}
              placeholder="e.g. ORD-2026-001"
              value={newOrder.order_id}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, order_id: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Date Label
            </label>
            <input
              className={inputClass}
              placeholder="e.g. March 13, 2026"
              value={newOrder.created_at_label}
              onChange={(e) =>
                setNewOrder((v) => ({
                  ...v,
                  created_at_label: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Order Title
            </label>
            <input
              className={inputClass}
              placeholder="e.g. iPhone 15 Pro + Case"
              value={newOrder.title}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">
              Status
            </label>
            <select
              className={inputClass}
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder((v) => ({
                  ...v,
                  status: e.target.value as OrderRow["status"],
                }))
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark">Total</label>
            <input
              className={inputClass}
              placeholder="e.g. $149.99"
              value={newOrder.total}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, total: e.target.value }))
              }
            />
          </div>
        </div>
        <button
          disabled={isSaving}
          className={primaryBtnClass}
          onClick={() => {
            if (!newOrder.user_id.trim()) {
              setAddStatus({ type: "error", msg: "User ID is required." });
              return;
            }
            if (!newOrder.order_id.trim()) {
              setAddStatus({ type: "error", msg: "Order code is required." });
              return;
            }
            if (!newOrder.title.trim()) {
              setAddStatus({ type: "error", msg: "Order title is required." });
              return;
            }
            saveAction(async () => {
              if (!supabase) return;
              const { error } = await supabase.from("orders").insert(newOrder);
              if (error) throw error;
              setAddStatus({
                type: "success",
                msg: "Order added successfully!",
              });
              setNewOrder({
                user_id: "",
                order_id: "",
                created_at_label: "",
                status: "processing",
                total: "$0",
                title: "",
              });
            });
          }}
        >
          {isSaving ? "Saving…" : "Add Order"}
        </button>
      </div>

      {/* Search */}
      <input
        className={`${inputClass} mb-4`}
        placeholder="Search orders…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* List */}
      <div className="space-y-2">
        {pageItems.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4"
          >
            {editingId === `order-${o.id}` ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">User ID</label>
                    <input
                      className={inputClass}
                      value={editingDraft.user_id || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          user_id: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Order Code
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.order_id || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          order_id: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Date Label
                    </label>
                    <input
                      className={inputClass}
                      value={editingDraft.created_at_label || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          created_at_label: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">
                      Order Title
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
                    <label className="block text-xs text-dark-4">Status</label>
                    <select
                      className={inputClass}
                      value={editingDraft.status || "processing"}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          status: e.target.value,
                        }))
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs text-dark-4">Total</label>
                    <input
                      className={inputClass}
                      value={editingDraft.total || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          total: e.target.value,
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
                      if (!editingDraft.user_id.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "User ID is required.",
                        });
                        return;
                      }
                      if (!editingDraft.order_id.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Order code is required.",
                        });
                        return;
                      }
                      if (!editingDraft.title.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Order title is required.",
                        });
                        return;
                      }
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("orders")
                          .update({
                            user_id: editingDraft.user_id,
                            order_id: editingDraft.order_id,
                            title: editingDraft.title,
                            created_at_label: editingDraft.created_at_label,
                            status: editingDraft.status,
                            total: editingDraft.total,
                          })
                          .eq("id", o.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Order updated successfully!",
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
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-dark">{o.order_id}</p>
                    <span className={statusBadgeClass(o.status)}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-3">{o.title}</p>
                  <p className="text-xs text-dark-4 mt-0.5">
                    {o.created_at_label} · {o.total}
                  </p>
                </div>
                <div className="flex gap-2 items-center shrink-0 flex-wrap">
                  <select
                    className="rounded-lg border border-gray-3 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-blue"
                    value={o.status}
                    disabled={isSaving}
                    onChange={(e) =>
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("orders")
                          .update({ status: e.target.value })
                          .eq("id", o.id);
                        if (error) throw error;
                      })
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    className={primaryBtnClass}
                    onClick={() => startEdit(`order-${o.id}`, o)}
                  >
                    Edit
                  </button>
                  {pendingDelete === `order-${o.id}` ? (
                    <div className="flex gap-2">
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 transition disabled:opacity-60"
                        disabled={isSaving}
                        onClick={() => {
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("orders")
                              .delete()
                              .eq("id", o.id);
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
                      onClick={() => setPendingDelete(`order-${o.id}`)}
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
            No orders found.
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
