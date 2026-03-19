"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ProductRow,
  CategoryRow,
  ProductDetailEnumRow,
  ProductDetailsForm,
  EnumGroupKey,
  MultiSelectOption,
  SaveAction,
} from "./types";
import {
  inputClass,
  sectionCardClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "./constants";
import { paginate, defaultProductDetails, fromProductDetails } from "./utils";
import { Pager } from "./Pager";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

// ---------------------------------------------------------------------------
// CheckedMultiSelect — dropdown with checkboxes for multi-select enum options
// ---------------------------------------------------------------------------
interface CheckedMultiSelectProps {
  label: string;
  value: string[];
  options: MultiSelectOption[];
  onChange: (nextValue: string[]) => void;
}

const CheckedMultiSelect = ({
  label,
  value,
  options,
  onChange,
}: CheckedMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedTitles = options
    .filter((option) => value.includes(option.id))
    .map((option) => option.title);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((currentId) => currentId !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <p className="text-xs text-dark-4">{label}</p>
      <button
        type="button"
        className="w-full rounded-xl border border-gray-3 bg-white px-3.5 py-2.5 text-left text-sm outline-none transition hover:border-blue focus:border-blue focus:ring-2 focus:ring-blue/20"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="block truncate text-dark">
          {selectedTitles.length
            ? `${selectedTitles.length} selected: ${selectedTitles.join(", ")}`
            : "Select options"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-gray-3 bg-white p-2 shadow-lg">
          {options.length ? (
            options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-gray-1"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.id)}
                  onChange={() => toggle(option.id)}
                />
                <span>{option.title}</span>
              </label>
            ))
          ) : (
            <p className="px-2 py-2 text-sm text-dark-4">
              No options available
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Product-specific helpers
// ---------------------------------------------------------------------------
const toArray = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const makeSelectOptions = (
  enums: ProductDetailEnumRow[],
  group: EnumGroupKey,
) => enums.filter((item) => item.enum_group === group);

const toOptionObjects = (
  enums: ProductDetailEnumRow[],
  group: EnumGroupKey,
  selectedIds: string[],
) => {
  const byId = new Map(
    makeSelectOptions(enums, group).map((item) => [
      item.option_id,
      item.option_title,
    ]),
  );
  return selectedIds.map((id) => ({ id, title: byId.get(id) || id }));
};

const toStringValues = (
  enums: ProductDetailEnumRow[],
  group: EnumGroupKey,
  selectedIds: string[],
) => {
  const byId = new Map(
    makeSelectOptions(enums, group).map((item) => [
      item.option_id,
      item.option_title,
    ]),
  );
  return selectedIds.map((id) => byId.get(id) || id);
};

const selectedLabels = (
  enums: ProductDetailEnumRow[],
  group: EnumGroupKey,
  selectedIds: string[],
) => {
  const byId = new Map(
    makeSelectOptions(enums, group).map((item) => [
      item.option_id,
      item.option_title,
    ]),
  );
  return selectedIds.map((id) => byId.get(id) || id).filter(Boolean);
};

const buildProductDetailsPayload = (
  details: ProductDetailsForm,
  enums: ProductDetailEnumRow[],
) => ({
  rating: Number(details.rating || 0),
  category: details.category,
  shortDescription: details.shortDescription,
  description: details.description,
  availability: details.availability,
  badge: details.badge,
  promoText: details.promoText,
  brand: details.brand,
  model: details.model,
  colors: toStringValues(enums, "colors", details.colors),
  gender: toStringValues(enums, "gender", details.gender),
  highlights: details.highlights
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  specificationSummary: details.specificationSummary,
  careInstructions: details.careInstructions,
  optionsGroup1: toOptionObjects(enums, "optionsGroup1", details.optionsGroup1),
  optionsGroup2: toOptionObjects(enums, "optionsGroup2", details.optionsGroup2),
  optionsGroup3: toOptionObjects(enums, "optionsGroup3", details.optionsGroup3),
  additionalInformation: details.additionalInformation
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      return { label: (label || "").trim(), value };
    })
    .filter((item) => item.label && item.value),
});

const OPTION_GROUPS: Array<{
  key: "optionsGroup1" | "optionsGroup2" | "optionsGroup3";
  label: string;
}> = [
  { key: "optionsGroup1", label: "Option Group 1" },
  { key: "optionsGroup2", label: "Option Group 2" },
  { key: "optionsGroup3", label: "Option Group 3" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ProductsTabProps {
  products: ProductRow[];
  categories: CategoryRow[];
  productDetailEnums: ProductDetailEnumRow[];
  isSaving: boolean;
  supabase: SupabaseClient;
  saveAction: SaveAction;
}

export const ProductsTab = ({
  products,
  categories,
  productDetailEnums,
  isSaving,
  supabase,
  saveAction,
}: ProductsTabProps) => {
  const [mode, setMode] = useState<"list" | "add">("list");
  const [addStatus, setAddStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    reviews: 0,
    price: 0,
    discounted_price: 0,
    thumbnails: [""] as string[],
    previews: [""] as string[],
    details: defaultProductDetails(),
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState("");
  const [editingDraft, setEditingDraft] = useState<Record<string, any>>({});

  const startEdit = (id: string, row: ProductRow) => {
    setEditingId(id);
    setEditingDraft({
      ...row,
      details: fromProductDetails(row.details || {}),
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDraft({});
  };

  const selectOptions = (group: EnumGroupKey) =>
    makeSelectOptions(productDetailEnums, group);

  const addPreviewGallery =
    newProduct.previews.filter(Boolean).length > 0
      ? newProduct.previews.filter(Boolean)
      : newProduct.thumbnails.filter(Boolean);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  return (
    <div className={sectionCardClass}>
      {/* Header with mode switcher */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-medium text-lg">Products ({products.length})</h3>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded-md border text-sm ${
              mode === "list"
                ? "bg-blue text-white border-blue"
                : "bg-white border-gray-3 text-dark"
            }`}
            onClick={() => setMode("list")}
          >
            Product List
          </button>
          <button
            className={`px-3 py-2 rounded-md border text-sm ${
              mode === "add"
                ? "bg-blue text-white border-blue"
                : "bg-white border-gray-3 text-dark"
            }`}
            onClick={() => setMode("add")}
          >
            Add Product Workspace
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ADD WORKSPACE                                                        */}
      {/* ------------------------------------------------------------------ */}
      {mode === "add" && (
        <div className="space-y-5">
          {/* Status banner */}
          {addStatus && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                addStatus.type === "success"
                  ? "border-green/30 bg-green/10 text-green"
                  : "border-red/30 bg-red/10 text-red"
              }`}
            >
              {addStatus.msg}
            </div>
          )}

          <div className="rounded-2xl border border-gray-3 bg-gray-1/50 p-3 sm:p-4">
            <p className="text-sm text-dark-4">
              Live preview mirrors the Shop Details layout. Fields marked{" "}
              <span className="text-red font-medium">*</span> are required.
            </p>
          </div>

          {/* Live preview */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6">
            {/* Image panel */}
            <div className="rounded-2xl border border-gray-3 bg-white p-4">
              <p className="text-xs font-medium text-dark-4 mb-3 uppercase tracking-wide">
                Image Preview
              </p>
              <div className="relative rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 min-h-[300px] flex items-center justify-center">
                {addPreviewGallery[0] ? (
                  <Image
                    src={addPreviewGallery[0]}
                    alt={newProduct.title || "Product preview"}
                    width={340}
                    height={340}
                    className="object-contain max-h-[280px]"
                  />
                ) : (
                  <p className="text-dark-4 text-sm text-center px-4">
                    Add image URLs below to see a preview
                  </p>
                )}
              </div>
              {addPreviewGallery.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {addPreviewGallery
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className={`flex-shrink-0 rounded-lg border p-1.5 bg-white ${
                          index === 0 ? "border-blue" : "border-gray-3"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Preview ${index + 1}`}
                          width={60}
                          height={60}
                          className="h-14 w-14 object-contain"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="rounded-2xl border border-gray-3 bg-white p-5 space-y-3 overflow-y-auto max-h-[520px]">
              <p className="text-xs font-medium text-dark-4 uppercase tracking-wide">
                Product Preview
              </p>

              <div className="flex flex-wrap gap-2">
                {newProduct.details.badge && (
                  <span className="inline-flex rounded-full bg-green px-3 py-1 text-xs font-medium text-white">
                    {newProduct.details.badge}
                  </span>
                )}
                {newProduct.details.promoText && (
                  <span className="inline-flex rounded-full bg-blue/10 px-3 py-1 text-xs font-medium text-blue">
                    {newProduct.details.promoText}
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-xl text-dark leading-snug">
                {newProduct.title || (
                  <span className="text-dark-4 font-normal">
                    Product title will appear here
                  </span>
                )}
              </h4>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-yellow-500 text-sm">
                  {"★".repeat(
                    Math.round(Math.min(5, newProduct.details.rating)),
                  )}
                  {"☆".repeat(
                    5 - Math.round(Math.min(5, newProduct.details.rating)),
                  )}
                </span>
                <span className="text-sm text-dark-4">
                  {newProduct.details.rating.toFixed(1)} / 5.0
                </span>
                {newProduct.reviews > 0 && (
                  <span className="text-sm text-dark-4">
                    ({newProduct.reviews} reviews)
                  </span>
                )}
                {newProduct.details.availability ? (
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                      newProduct.details.availability === "In Stock"
                        ? "text-green"
                        : "text-orange-400"
                    }`}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-current" />
                    {newProduct.details.availability}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-4">
                    <span className="inline-block h-2 w-2 rounded-full bg-gray-3" />
                    Availability not set
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3">
                <span className="font-semibold text-dark text-2xl">
                  ${newProduct.discounted_price || 0}
                </span>
                {!!newProduct.price &&
                  newProduct.price !== newProduct.discounted_price && (
                    <span className="font-medium text-dark-4 text-base line-through">
                      ${newProduct.price}
                    </span>
                  )}
                {!!newProduct.price &&
                  newProduct.discounted_price > 0 &&
                  newProduct.discounted_price < newProduct.price && (
                    <span className="text-sm font-semibold text-green">
                      {Math.round(
                        (1 - newProduct.discounted_price / newProduct.price) *
                          100,
                      )}
                      % off
                    </span>
                  )}
              </div>

              {newProduct.details.shortDescription && (
                <p className="text-dark-3 text-sm leading-relaxed">
                  {newProduct.details.shortDescription}
                </p>
              )}

              {newProduct.details.highlights && (
                <ul className="flex flex-col gap-1.5">
                  {newProduct.details.highlights
                    .split(",")
                    .map((h) => h.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((highlight) => (
                      <li
                        key={highlight}
                        className="text-sm text-dark flex items-start gap-2"
                      >
                        <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue text-xs">
                          ✓
                        </span>
                        {highlight}
                      </li>
                    ))}
                </ul>
              )}

              <div className="space-y-2 border-t border-gray-3 pt-3 text-sm">
                {newProduct.details.category && (
                  <p className="text-dark">
                    <span className="font-medium">Category:</span>{" "}
                    {newProduct.details.category}
                  </p>
                )}
                {newProduct.details.brand && (
                  <p className="text-dark">
                    <span className="font-medium">Brand:</span>{" "}
                    {newProduct.details.brand}
                  </p>
                )}
                {newProduct.details.model && (
                  <p className="text-dark">
                    <span className="font-medium">Model / SKU:</span>{" "}
                    {newProduct.details.model}
                  </p>
                )}
                {newProduct.details.colors.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-dark">Colors:</span>
                    {selectedLabels(
                      productDetailEnums,
                      "colors",
                      newProduct.details.colors,
                    ).map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-3 bg-gray-1 px-2 py-0.5 text-xs"
                      >
                        {label.startsWith("#") && (
                          <span
                            className="inline-block h-3 w-3 flex-shrink-0 rounded-full border border-gray-3"
                            style={{ backgroundColor: label }}
                          />
                        )}
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {newProduct.details.gender.length > 0 && (
                  <p className="text-dark">
                    <span className="font-medium">Gender:</span>{" "}
                    {selectedLabels(
                      productDetailEnums,
                      "gender",
                      newProduct.details.gender,
                    ).join(", ")}
                  </p>
                )}
                {OPTION_GROUPS.map((group) =>
                  newProduct.details[group.key].length > 0 ? (
                    <p key={`preview-${group.key}`} className="text-dark">
                      <span className="font-medium">{group.label}:</span>{" "}
                      {selectedLabels(
                        productDetailEnums,
                        group.key,
                        newProduct.details[group.key],
                      ).join(", ")}
                    </p>
                  ) : null,
                )}
              </div>

              {newProduct.details.description && (
                <div className="border-t border-gray-3 pt-3">
                  <p className="text-sm font-medium text-dark mb-1">
                    Description
                  </p>
                  <p className="text-sm text-dark-3 leading-relaxed whitespace-pre-line">
                    {newProduct.details.description}
                  </p>
                </div>
              )}

              {newProduct.details.specificationSummary && (
                <div className="border-t border-gray-3 pt-3">
                  <p className="text-sm font-medium text-dark mb-1">
                    Specification Summary
                  </p>
                  <p className="text-sm text-dark-3 leading-relaxed whitespace-pre-line">
                    {newProduct.details.specificationSummary}
                  </p>
                </div>
              )}

              {newProduct.details.careInstructions && (
                <div className="border-t border-gray-3 pt-3">
                  <p className="text-sm font-medium text-dark mb-1">
                    Care Instructions
                  </p>
                  <p className="text-sm text-dark-3 leading-relaxed whitespace-pre-line">
                    {newProduct.details.careInstructions}
                  </p>
                </div>
              )}

              {newProduct.details.additionalInformation && (
                <div className="border-t border-gray-3 pt-3">
                  <p className="text-sm font-medium text-dark mb-2">
                    Specifications
                  </p>
                  <div className="space-y-1">
                    {newProduct.details.additionalInformation
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, i) => {
                        const colonIdx = line.indexOf(":");
                        if (colonIdx === -1) return null;
                        const label = line.slice(0, colonIdx).trim();
                        const val = line.slice(colonIdx + 1).trim();
                        return label && val ? (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="font-medium text-dark min-w-[90px] flex-shrink-0">
                              {label}
                            </span>
                            <span className="text-dark-3">{val}</span>
                          </div>
                        ) : null;
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Title <span className="text-red">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Tailored Linen Blazer"
                value={newProduct.title}
                onChange={(e) =>
                  setNewProduct((v) => ({ ...v, title: e.target.value }))
                }
              />
            </div>

            {/* Reviews */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Number of Reviews
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                placeholder="e.g. 42"
                value={newProduct.reviews || ""}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    reviews: Math.max(0, Number(e.target.value)),
                  }))
                }
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Original Price ($) <span className="text-red">*</span>
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 129.00"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    price: Math.max(0, Number(e.target.value)),
                  }))
                }
              />
            </div>

            {/* Discounted Price */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Discounted Price ($)
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 99.00"
                value={newProduct.discounted_price || ""}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    discounted_price: Math.max(0, Number(e.target.value)),
                  }))
                }
              />
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Rating (0 – 5)
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="e.g. 4.7"
                value={newProduct.details.rating || ""}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: {
                      ...v.details,
                      rating: Math.min(5, Math.max(0, Number(e.target.value))),
                    },
                  }))
                }
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Category
              </label>
              <select
                className={inputClass}
                value={newProduct.details.category}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, category: e.target.value },
                  }))
                }
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.title}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Availability
              </label>
              <select
                className={inputClass}
                value={newProduct.details.availability}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, availability: e.target.value },
                  }))
                }
              >
                <option value="">Select availability</option>
                {selectOptions("availability").map((item) => (
                  <option key={item.id} value={item.option_title}>
                    {item.option_title}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Brand
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Urban Loom, North Lane, Maison Vale"
                value={newProduct.details.brand}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, brand: e.target.value },
                  }))
                }
              />
            </div>

            {/* Model / SKU */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Model / SKU
              </label>
              <input
                className={inputClass}
                placeholder="e.g. LIN-BLZR-11 or SKU-FASH-001"
                value={newProduct.details.model}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, model: e.target.value },
                  }))
                }
              />
            </div>

            {/* Badge */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Badge Label
              </label>
              <input
                className={inputClass}
                placeholder="e.g. New Arrival, Best Seller, Sale"
                value={newProduct.details.badge}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, badge: e.target.value },
                  }))
                }
              />
            </div>

            {/* Promo Text */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Promo Text
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Free shipping on orders over $50"
                value={newProduct.details.promoText}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, promoText: e.target.value },
                  }))
                }
              />
            </div>

            {/* Highlights */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-dark">
                Highlights{" "}
                <span className="ml-1 text-xs text-dark-4 font-normal">
                  (comma-separated)
                </span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Breathable fabric, Tailored fit, Easy care"
                value={newProduct.details.highlights}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, highlights: e.target.value },
                  }))
                }
              />
            </div>

            {/* Colors */}
            <CheckedMultiSelect
              label="Colors"
              value={newProduct.details.colors}
              options={selectOptions("colors").map((item) => ({
                id: item.option_id,
                title: item.option_title,
              }))}
              onChange={(nextValue) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, colors: nextValue },
                }))
              }
            />

            {/* Gender */}
            <CheckedMultiSelect
              label="Gender"
              value={newProduct.details.gender}
              options={selectOptions("gender").map((item) => ({
                id: item.option_id,
                title: item.option_title,
              }))}
              onChange={(nextValue) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, gender: nextValue },
                }))
              }
            />

            {/* Option Groups */}
            {OPTION_GROUPS.map((group) => (
              <CheckedMultiSelect
                key={`new-${group.key}`}
                label={group.label}
                value={newProduct.details[group.key]}
                options={selectOptions(group.key).map((item) => ({
                  id: item.option_id,
                  title: item.option_title,
                }))}
                onChange={(nextValue) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, [group.key]: nextValue },
                  }))
                }
              />
            ))}

            {/* Short Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Short Description
              </label>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                placeholder="Brief product summary shown in listings (1–2 sentences)"
                value={newProduct.details.shortDescription}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: {
                      ...v.details,
                      shortDescription: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Full Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Full Description
              </label>
              <textarea
                className={`${inputClass} min-h-[110px]`}
                placeholder="Detailed product description shown on the product page"
                value={newProduct.details.description}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: { ...v.details, description: e.target.value },
                  }))
                }
              />
            </div>

            {/* Specification Summary */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Specification Summary
              </label>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                placeholder="Key specs overview, e.g. Material: Linen blend | Fit: Slim | Sizes: S-XL"
                value={newProduct.details.specificationSummary}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: {
                      ...v.details,
                      specificationSummary: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Care Instructions */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Care Instructions
              </label>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                placeholder="e.g. Machine wash cold, Do not tumble dry"
                value={newProduct.details.careInstructions}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: {
                      ...v.details,
                      careInstructions: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-1 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Additional Specifications{" "}
                <span className="ml-1 text-xs text-dark-4 font-normal">
                  (one per line: Label: Value)
                </span>
              </label>
              <textarea
                className={`${inputClass} min-h-[110px]`}
                placeholder={
                  "Weight: 265g\nDimensions: 159.9 × 76.7 × 8.25 mm\nBattery: 4685 mAh"
                }
                value={newProduct.details.additionalInformation}
                onChange={(e) =>
                  setNewProduct((v) => ({
                    ...v,
                    details: {
                      ...v.details,
                      additionalInformation: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* Thumbnails */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Thumbnail Images{" "}
                <span className="ml-1 text-xs text-dark-4 font-normal">
                  (small images used in product listings)
                </span>
              </label>
              {newProduct.thumbnails.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder={`Thumbnail URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => {
                      const next = [...newProduct.thumbnails];
                      next[idx] = e.target.value;
                      setNewProduct((v) => ({ ...v, thumbnails: next }));
                    }}
                  />
                  {url && (
                    <div className="flex-shrink-0 h-9 w-9 rounded-lg border border-gray-3 bg-gray-1 overflow-hidden">
                      <Image
                        src={url}
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {newProduct.thumbnails.length > 1 && (
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-lg border border-red/40 bg-red/5 px-2 py-1.5 text-xs text-red hover:bg-red hover:text-white transition"
                      onClick={() =>
                        setNewProduct((v) => ({
                          ...v,
                          thumbnails: v.thumbnails.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={secondaryBtnClass}
                onClick={() =>
                  setNewProduct((v) => ({
                    ...v,
                    thumbnails: [...v.thumbnails, ""],
                  }))
                }
              >
                + Add Thumbnail
              </button>
            </div>

            {/* Previews */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-dark">
                Preview Images{" "}
                <span className="ml-1 text-xs text-dark-4 font-normal">
                  (full-size images shown on the product detail page)
                </span>
              </label>
              {newProduct.previews.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    placeholder={`Preview URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => {
                      const next = [...newProduct.previews];
                      next[idx] = e.target.value;
                      setNewProduct((v) => ({ ...v, previews: next }));
                    }}
                  />
                  {url && (
                    <div className="flex-shrink-0 h-9 w-9 rounded-lg border border-gray-3 bg-gray-1 overflow-hidden">
                      <Image
                        src={url}
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {newProduct.previews.length > 1 && (
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-lg border border-red/40 bg-red/5 px-2 py-1.5 text-xs text-red hover:bg-red hover:text-white transition"
                      onClick={() =>
                        setNewProduct((v) => ({
                          ...v,
                          previews: v.previews.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={secondaryBtnClass}
                onClick={() =>
                  setNewProduct((v) => ({
                    ...v,
                    previews: [...v.previews, ""],
                  }))
                }
              >
                + Add Preview Image
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              disabled={isSaving}
              className={primaryBtnClass}
              onClick={async () => {
                setAddStatus(null);
                if (!newProduct.title.trim()) {
                  setAddStatus({
                    type: "error",
                    msg: "Product title is required.",
                  });
                  return;
                }
                if (!newProduct.price || newProduct.price <= 0) {
                  setAddStatus({
                    type: "error",
                    msg: "Original price must be greater than 0.",
                  });
                  return;
                }
                if (
                  newProduct.discounted_price > 0 &&
                  newProduct.discounted_price > newProduct.price
                ) {
                  setAddStatus({
                    type: "error",
                    msg: "Discounted price cannot be higher than the original price.",
                  });
                  return;
                }
                const duplicate = products.find(
                  (p) =>
                    p.title.trim().toLowerCase() ===
                    newProduct.title.trim().toLowerCase(),
                );
                if (duplicate) {
                  setAddStatus({
                    type: "error",
                    msg: `A product named "${duplicate.title}" already exists. Use a unique title.`,
                  });
                  return;
                }
                await saveAction(async () => {
                  if (!supabase) return;
                  const { error } = await supabase.from("products").insert({
                    title: newProduct.title.trim(),
                    reviews: newProduct.reviews,
                    price: newProduct.price,
                    discounted_price:
                      newProduct.discounted_price || newProduct.price,
                    thumbnails: newProduct.thumbnails.filter(Boolean),
                    previews: newProduct.previews.filter(Boolean),
                    details: buildProductDetailsPayload(
                      newProduct.details,
                      productDetailEnums,
                    ),
                  });
                  if (error) throw error;
                  setNewProduct({
                    title: "",
                    reviews: 0,
                    price: 0,
                    discounted_price: 0,
                    thumbnails: [""],
                    previews: [""],
                    details: defaultProductDetails(),
                  });
                  setAddStatus({
                    type: "success",
                    msg: "Product added successfully! You can add another or go back to the list.",
                  });
                });
              }}
            >
              {isSaving ? "Adding…" : "Add Product"}
            </button>
            <button
              className={secondaryBtnClass}
              onClick={() => {
                setMode("list");
                setAddStatus(null);
              }}
            >
              Back to List
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* LIST VIEW                                                            */}
      {/* ------------------------------------------------------------------ */}
      {mode === "list" && (
        <>
          <input
            className={`${inputClass} mb-4`}
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="space-y-2">
            {pageItems.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4 flex items-center justify-between gap-3"
              >
                {editingId === `product-${p.id}` ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      className={inputClass}
                      placeholder="Title"
                      value={editingDraft.title || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          title: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      placeholder="Reviews"
                      value={editingDraft.reviews || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          reviews: Number(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      placeholder="Price"
                      value={editingDraft.price || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      placeholder="Discounted price"
                      value={editingDraft.discounted_price || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          discounted_price: Number(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Thumbnails (comma separated)"
                      value={(editingDraft.thumbnails || []).join(", ")}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          thumbnails: toArray(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Previews (comma separated)"
                      value={(editingDraft.previews || []).join(", ")}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          previews: toArray(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      step="0.1"
                      placeholder="Rating"
                      value={editingDraft.details?.rating || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            rating: Number(e.target.value),
                          },
                        }))
                      }
                    />
                    <select
                      className={inputClass}
                      value={editingDraft.details?.category || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            category: e.target.value,
                          },
                        }))
                      }
                    >
                      {editingDraft.details?.category &&
                      !categories.some(
                        (c) => c.title === editingDraft.details?.category,
                      ) ? (
                        <option value={editingDraft.details?.category}>
                          {editingDraft.details?.category}
                        </option>
                      ) : null}
                      {!editingDraft.details?.category ? (
                        <option value="">Select category</option>
                      ) : null}
                      {categories.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <textarea
                      className={`${inputClass} md:col-span-2 min-h-[92px]`}
                      placeholder="Short description"
                      value={editingDraft.details?.shortDescription || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            shortDescription: e.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      className={`${inputClass} md:col-span-2 min-h-[92px]`}
                      placeholder="Long description"
                      value={editingDraft.details?.description || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            description: e.target.value,
                          },
                        }))
                      }
                    />
                    <select
                      className={inputClass}
                      value={editingDraft.details?.availability || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            availability: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">Select availability</option>
                      {selectOptions("availability").map((item) => (
                        <option key={item.id} value={item.option_title}>
                          {item.option_title}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      placeholder="Brand"
                      value={editingDraft.details?.brand || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            brand: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Model / SKU"
                      value={editingDraft.details?.model || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            model: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Badge"
                      value={editingDraft.details?.badge || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            badge: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Promo text"
                      value={editingDraft.details?.promoText || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            promoText: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Highlights (comma separated)"
                      value={editingDraft.details?.highlights || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            highlights: e.target.value,
                          },
                        }))
                      }
                    />
                    <CheckedMultiSelect
                      label="Colors"
                      value={editingDraft.details?.colors || []}
                      options={selectOptions("colors").map((item) => ({
                        id: item.option_id,
                        title: item.option_title,
                      }))}
                      onChange={(nextValue) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            colors: nextValue,
                          },
                        }))
                      }
                    />
                    <CheckedMultiSelect
                      label="Gender"
                      value={editingDraft.details?.gender || []}
                      options={selectOptions("gender").map((item) => ({
                        id: item.option_id,
                        title: item.option_title,
                      }))}
                      onChange={(nextValue) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            gender: nextValue,
                          },
                        }))
                      }
                    />
                    {OPTION_GROUPS.map((group) => (
                      <CheckedMultiSelect
                        key={`edit-${p.id}-${group.key}`}
                        label={group.label}
                        value={editingDraft.details?.[group.key] || []}
                        options={selectOptions(group.key).map((item) => ({
                          id: item.option_id,
                          title: item.option_title,
                        }))}
                        onChange={(nextValue) =>
                          setEditingDraft((d) => ({
                            ...d,
                            details: {
                              ...(d.details || {}),
                              [group.key]: nextValue,
                            },
                          }))
                        }
                      />
                    ))}
                    <textarea
                      className={`${inputClass} md:col-span-2 min-h-[92px]`}
                      placeholder="Specification summary"
                      value={editingDraft.details?.specificationSummary || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            specificationSummary: e.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      className={`${inputClass} md:col-span-2 min-h-[92px]`}
                      placeholder="Care instructions"
                      value={editingDraft.details?.careInstructions || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            careInstructions: e.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      className={`${inputClass} md:col-span-2 min-h-[110px]`}
                      placeholder="Specifications / additional info (one per line: Label: Value)"
                      value={editingDraft.details?.additionalInformation || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          details: {
                            ...(d.details || {}),
                            additionalInformation: e.target.value,
                          },
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        className={primaryBtnClass}
                        disabled={isSaving}
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("products")
                              .update({
                                title: editingDraft.title,
                                reviews: editingDraft.reviews,
                                price: editingDraft.price,
                                discounted_price: editingDraft.discounted_price,
                                thumbnails: editingDraft.thumbnails || [],
                                previews: editingDraft.previews || [],
                                details: buildProductDetailsPayload(
                                  editingDraft.details ||
                                    defaultProductDetails(),
                                  productDetailEnums,
                                ),
                              })
                              .eq("id", p.id);
                            if (error) throw error;
                            cancelEdit();
                          })
                        }
                      >
                        Save
                      </button>
                      <button
                        className={secondaryBtnClass}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm">
                        ${p.discounted_price} / ${p.price}
                      </p>
                      <p className="text-xs text-dark-4 mt-1">
                        {p.details?.category || "Uncategorized"}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {(p.thumbnails || []).slice(0, 3).map((img, idx) => (
                          <Image
                            key={`${p.id}-thumb-${idx}`}
                            src={img}
                            alt={p.title}
                            className="h-10 w-10 rounded border border-gray-3 object-cover"
                            width={40}
                            height={40}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={primaryBtnClass}
                        onClick={() => startEdit(`product-${p.id}`, p)}
                      >
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white"
                        disabled={isSaving}
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("products")
                              .delete()
                              .eq("id", p.id);
                            if (error) throw error;
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {!pageItems.length && (
              <p className="text-sm text-dark-4 py-4 text-center">
                No products found.
              </p>
            )}
          </div>

          <Pager
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
