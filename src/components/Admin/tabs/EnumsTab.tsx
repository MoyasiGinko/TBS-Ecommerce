"use client";

import React, { useState } from "react";
import { ProductDetailEnumRow, EnumGroupKey } from "./types";
import { inputClass, sectionCardClass, primaryBtnClass } from "./constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

const ENUM_GROUPS: Array<{ key: EnumGroupKey; label: string }> = [
  { key: "optionsGroup1", label: "Option Group 1" },
  { key: "optionsGroup2", label: "Option Group 2" },
  { key: "optionsGroup3", label: "Option Group 3" },
  { key: "colors", label: "Colors" },
  { key: "gender", label: "Gender" },
  { key: "availability", label: "Availability" },
];

const cleanEnumOptionId = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9#]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface EnumsTabProps {
  productDetailEnums: ProductDetailEnumRow[];
  setProductDetailEnums: React.Dispatch<
    React.SetStateAction<ProductDetailEnumRow[]>
  >;
  supabase: SupabaseClient;
}

export const EnumsTab = ({
  productDetailEnums,
  setProductDetailEnums,
  supabase,
}: EnumsTabProps) => {
  const [newEnumOptionByGroup, setNewEnumOptionByGroup] = useState<
    Record<EnumGroupKey, string>
  >({
    optionsGroup1: "",
    optionsGroup2: "",
    optionsGroup3: "",
    colors: "",
    gender: "",
    availability: "",
  });
  const [enumStatus, setEnumStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? productDetailEnums.filter((item) =>
        (item.option_title + item.option_id + item.enum_group)
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : null;

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Product Detail Enum Options</h3>
      <p className="text-sm text-dark-4 mb-4">
        {productDetailEnums.length} option
        {productDetailEnums.length === 1 ? "" : "s"} across {ENUM_GROUPS.length}{" "}
        groups
      </p>

      {enumStatus && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            enumStatus.type === "success"
              ? "border-green/30 bg-green/10 text-green"
              : "border-red/30 bg-red/10 text-red"
          }`}
        >
          {enumStatus.msg}
        </div>
      )}

      <input
        className={`${inputClass} mb-4`}
        placeholder="Search enum options…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ENUM_GROUPS.map((group) => {
          const options = (filtered ?? productDetailEnums)
            .filter((item) => item.enum_group === group.key)
            .sort((a, b) => a.option_title.localeCompare(b.option_title));

          return (
            <div
              key={group.key}
              className="rounded-xl border border-gray-3 bg-white p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-dark">{group.label}</p>
                <span className="text-xs text-dark-4">
                  {options.length} option{options.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mb-3 space-y-2">
                {options.length ? (
                  options.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-gray-3 bg-gray-1 px-3 py-2"
                    >
                      <p className="text-sm text-dark">{item.option_title}</p>
                      <button
                        className="text-xs rounded-md border border-red/40 px-2 py-1 text-red hover:bg-red hover:text-white transition disabled:opacity-50"
                        disabled={isSaving}
                        onClick={() => {
                          void (async () => {
                            if (!supabase) {
                              setEnumStatus({
                                type: "error",
                                msg: "Supabase env is missing. Check .env.local.",
                              });
                              return;
                            }
                            setIsSaving(true);
                            setEnumStatus(null);
                            try {
                              const { error } = await supabase
                                .from("product_detail_enums")
                                .delete()
                                .eq("id", item.id);
                              if (error) throw error;
                              setProductDetailEnums((prev) =>
                                prev.filter((row) => row.id !== item.id),
                              );
                              setEnumStatus({
                                type: "success",
                                msg: `Removed "${item.option_title}" from ${group.label}.`,
                              });
                            } catch (error: any) {
                              setEnumStatus({
                                type: "error",
                                msg:
                                  error?.message ||
                                  "Failed to remove enum option.",
                              });
                            } finally {
                              setIsSaving(false);
                            }
                          })();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-4">No options yet.</p>
                )}
              </div>

              {/* Add input */}
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder={`Add ${group.label} option…`}
                  value={newEnumOptionByGroup[group.key]}
                  onChange={(e) => {
                    setEnumStatus(null);
                    setNewEnumOptionByGroup((prev) => ({
                      ...prev,
                      [group.key]: e.target.value,
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
                <button
                  className={primaryBtnClass}
                  disabled={isSaving}
                  onClick={() => {
                    const optionTitle = newEnumOptionByGroup[group.key].trim();
                    const optionId = cleanEnumOptionId(optionTitle);

                    if (!optionTitle) {
                      setEnumStatus({
                        type: "error",
                        msg: `Enter a ${group.label.toLowerCase()} option before saving.`,
                      });
                      return;
                    }
                    if (!optionId) {
                      setEnumStatus({
                        type: "error",
                        msg: `${group.label} option must include letters or numbers.`,
                      });
                      return;
                    }

                    const duplicate = productDetailEnums.find(
                      (item) =>
                        item.enum_group === group.key &&
                        (item.option_id === optionId ||
                          item.option_title.trim().toLowerCase() ===
                            optionTitle.toLowerCase()),
                    );
                    if (duplicate) {
                      setEnumStatus({
                        type: "error",
                        msg: `"${optionTitle}" already exists in ${group.label}.`,
                      });
                      return;
                    }

                    void (async () => {
                      if (!supabase) {
                        setEnumStatus({
                          type: "error",
                          msg: "Supabase env is missing. Check .env.local.",
                        });
                        return;
                      }
                      setIsSaving(true);
                      setEnumStatus(null);
                      try {
                        const { data, error } = await supabase
                          .from("product_detail_enums")
                          .insert({
                            enum_group: group.key,
                            option_id: optionId,
                            option_title: optionTitle,
                          })
                          .select(
                            "id,enum_group,option_id,option_title,sort_order",
                          )
                          .single();
                        if (error) throw error;
                        if (data) {
                          setProductDetailEnums((prev) =>
                            [...prev, data as ProductDetailEnumRow].sort(
                              (left, right) => {
                                const groupOrder =
                                  left.enum_group.localeCompare(
                                    right.enum_group,
                                  );
                                if (groupOrder !== 0) return groupOrder;
                                const sortOrder =
                                  left.sort_order - right.sort_order;
                                if (sortOrder !== 0) return sortOrder;
                                return left.option_title.localeCompare(
                                  right.option_title,
                                );
                              },
                            ),
                          );
                        }
                        setNewEnumOptionByGroup((prev) => ({
                          ...prev,
                          [group.key]: "",
                        }));
                        setEnumStatus({
                          type: "success",
                          msg: `Added "${optionTitle}" to ${group.label}.`,
                        });
                      } catch (error: any) {
                        setEnumStatus({
                          type: "error",
                          msg: error?.message || "Failed to add enum option.",
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    })();
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
