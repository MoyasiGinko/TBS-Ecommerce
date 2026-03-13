"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SiteContentRow, SaveAction } from "./types";
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

// ---------------------------------------------------------------------------
// Value-type detection
// ---------------------------------------------------------------------------
type FieldType = "string" | "number" | "boolean" | "array" | "object";

type NewValueKind = "string" | "number" | "boolean" | "object" | "array";

function detectType(value: any): FieldType {
  if (value === null || value === undefined) return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return "string";
}

function humanLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
}

function createValueByKind(kind: NewValueKind): any {
  if (kind === "number") return 0;
  if (kind === "boolean") return false;
  if (kind === "object") return {};
  if (kind === "array") return [];
  return "";
}

// ---------------------------------------------------------------------------
// Item summary – single-line preview for collapsed nodes
// ---------------------------------------------------------------------------
function getItemSummary(value: any): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (typeof value === "object") {
    const strings = Object.entries(value)
      .filter(
        ([, v]) =>
          typeof v === "string" &&
          (v as string).length > 0 &&
          (v as string).length < 60,
      )
      .slice(0, 3)
      .map(([, v]) => v as string);
    if (strings.length) return strings.join(" · ");
    return `{${Object.keys(value).length} fields}`;
  }
  return String(value).slice(0, 80);
}

// ---------------------------------------------------------------------------
// Depth-based visual hierarchy (cycles every 4 levels)
// ---------------------------------------------------------------------------
type DepthStyle = { container: string; header: string; badge: string };
const DEPTH_STYLES: DepthStyle[] = [
  {
    container: "border-gray-3 bg-gray-1/40",
    header: "bg-gray-1 border-b border-gray-3",
    badge: "bg-blue/10 text-blue",
  },
  {
    container: "border-blue/20 bg-blue/5",
    header: "bg-blue/10 border-b border-blue/20",
    badge: "bg-blue/10 text-blue",
  },
  {
    container: "border-teal/20 bg-teal/5",
    header: "bg-teal/10 border-b border-teal/20",
    badge: "bg-teal/10 text-teal",
  },
  {
    container: "border-orange/20 bg-orange/5",
    header: "bg-orange/10 border-b border-orange/20",
    badge: "bg-orange/10 text-orange",
  },
];
function getDepthStyle(depth: number): DepthStyle {
  return DEPTH_STYLES[depth % DEPTH_STYLES.length];
}

// ---------------------------------------------------------------------------
// JSON sub-editor (needs its own useState so it must be a separate component)
// ---------------------------------------------------------------------------
function JsonSubEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState("");
  return (
    <div className="space-y-1">
      <textarea
        className={`${inputClass} font-mono text-xs min-h-[100px]`}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr("");
          } catch {
            setErr("Invalid JSON");
          }
        }}
      />
      {err && <p className="text-xs text-red">{err}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ArrayNodeEditor – recursive dynamic array editor
// ---------------------------------------------------------------------------
function ArrayNodeEditor({
  items,
  onChange,
  depth,
}: {
  items: any[];
  onChange: (v: any[]) => void;
  depth: number;
}) {
  const [collapsed, setCollapsed] = useState<Set<number>>(() => {
    // Start objects/arrays collapsed so the list doesn't overwhelm
    const init = new Set<number>();
    items.forEach((item, i) => {
      if (item !== null && typeof item === "object") init.add(i);
    });
    return init;
  });
  const [newItemType, setNewItemType] = useState<NewValueKind>("object");

  const ds = getDepthStyle(depth);

  const toggleItem = (i: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const moveItem = (from: number, to: number) => {
    const next = [...items];
    const [el] = next.splice(from, 1);
    next.splice(to, 0, el);
    onChange(next);
    setCollapsed((prev) => {
      const updated = new Set<number>();
      prev.forEach((idx) => {
        if (idx === from) updated.add(to);
        else if (idx === to) updated.add(from);
        else updated.add(idx);
      });
      return updated;
    });
  };

  const removeItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    setCollapsed((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      });
      return next;
    });
  };

  const duplicateItem = (i: number) => {
    const cloned = JSON.parse(JSON.stringify(items[i]));
    const next = [...items];
    next.splice(i + 1, 0, cloned);
    onChange(next);
    setCollapsed((prev) => {
      const shifted = new Set<number>();
      prev.forEach((idx) => {
        shifted.add(idx <= i ? idx : idx + 1);
      });
      if (cloned !== null && typeof cloned === "object") shifted.add(i + 1);
      return shifted;
    });
  };

  return (
    <div className={`space-y-2 rounded-xl border p-3 ${ds.container}`}>
      {items.length === 0 && (
        <p className="text-xs text-dark-4 italic text-center py-2">
          No items yet — add one below.
        </p>
      )}

      {items.map((item, i) => {
        const type = detectType(item);
        const isComplex = type === "object" || type === "array";
        const isCollapsed = collapsed.has(i);
        const summary = isCollapsed ? getItemSummary(item) : "";

        return (
          <div
            key={i}
            className="rounded-lg border border-gray-3/70 bg-white overflow-hidden shadow-sm"
          >
            {/* ── Item header ─────────────────────────────────────── */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-2 ${ds.header}`}
            >
              {/* Collapse toggle */}
              {isComplex ? (
                <button
                  type="button"
                  onClick={() => toggleItem(i)}
                  className="w-5 h-5 flex items-center justify-center text-dark-4 hover:text-dark text-[10px] shrink-0"
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? "▶" : "▼"}
                </button>
              ) : (
                <span className="w-5 shrink-0" />
              )}

              {/* Index badge */}
              <span className="text-[11px] font-bold text-dark-3 shrink-0">
                #{i + 1}
              </span>

              {/* Type badge */}
              <span
                className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded shrink-0 ${ds.badge}`}
              >
                {type}
              </span>

              {/* Collapsed summary */}
              {isCollapsed && summary && (
                <span className="text-xs text-dark-4 truncate flex-1 min-w-0">
                  {summary}
                </span>
              )}
              {!isCollapsed && <span className="flex-1" />}

              {/* Controls */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  title="Move up"
                  disabled={i === 0}
                  onClick={() => moveItem(i, i - 1)}
                  className="w-6 h-6 flex items-center justify-center text-dark-4 hover:text-dark disabled:opacity-25 text-xs rounded"
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => moveItem(i, i + 1)}
                  className="w-6 h-6 flex items-center justify-center text-dark-4 hover:text-dark disabled:opacity-25 text-xs rounded"
                >
                  ↓
                </button>
                <button
                  type="button"
                  title="Duplicate item"
                  onClick={() => duplicateItem(i)}
                  className="w-6 h-6 flex items-center justify-center text-dark-4 hover:text-blue text-xs rounded"
                >
                  ⊕
                </button>
                <button
                  type="button"
                  title="Remove item"
                  onClick={() => removeItem(i)}
                  className="w-6 h-6 flex items-center justify-center text-red hover:text-red-dark text-xs rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Item content (hidden when collapsed+complex) ─────── */}
            {(!isComplex || !isCollapsed) && (
              <div className="p-2.5">
                <SmartFieldEditor
                  value={item}
                  onChange={(updated) => {
                    const next = [...items];
                    next[i] = updated;
                    onChange(next);
                  }}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── Add item row ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center pt-1.5 border-t border-gray-3/40">
        <select
          className={`${inputClass} w-auto py-1.5 text-xs`}
          value={newItemType}
          onChange={(e) => setNewItemType(e.target.value as NewValueKind)}
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="object">Object {"{}"}</option>
          <option value="array">Array {"[]"}</option>
        </select>
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            const newVal = createValueByKind(newItemType);
            onChange([...items, newVal]);
            if (newItemType === "object" || newItemType === "array") {
              setCollapsed((prev) => {
                const next = new Set<number>();
                prev.forEach((idx) => next.add(idx));
                next.add(items.length);
                return next;
              });
            }
          }}
        >
          + Add Item
        </button>
        {items.length > 0 &&
          ["object", "array"].includes(detectType(items[items.length - 1])) && (
            <button
              type="button"
              className={secondaryBtnClass}
              title="Clone the last item as a starting template"
              onClick={() => duplicateItem(items.length - 1)}
            >
              ⊕ Duplicate Last
            </button>
          )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ObjectNodeEditor – recursive dynamic object editor
// ---------------------------------------------------------------------------
function ObjectNodeEditor({
  obj,
  onChange,
  depth = 0,
}: {
  obj: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  depth?: number;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    // Start complex fields collapsed so the view stays clean
    const init = new Set<string>();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== null && typeof v === "object") init.add(k);
    });
    return init;
  });
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<NewValueKind>("string");

  const ds = getDepthStyle(depth);
  const entries = Object.entries(obj);

  const toggleField = (k: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const removeField = (k: string) => {
    const next = { ...obj };
    delete next[k];
    onChange(next);
    setCollapsed((prev) => {
      const next2 = new Set(prev);
      next2.delete(k);
      return next2;
    });
  };

  return (
    <div className={`space-y-2 rounded-xl border p-3 ${ds.container}`}>
      {entries.length === 0 && (
        <p className="text-xs text-dark-4 italic text-center py-1">
          Empty object — add fields below.
        </p>
      )}

      {entries.map(([k, v]) => {
        const type = detectType(v);
        const isComplex = type === "object" || type === "array";
        const isCollapsed = collapsed.has(k);
        const summary = isCollapsed ? getItemSummary(v) : "";

        return (
          <div
            key={k}
            className="rounded-lg border border-gray-3/70 bg-white overflow-hidden shadow-sm"
          >
            {/* ── Field header ─────────────────────────────────────── */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-2 ${ds.header}`}
            >
              {/* Collapse toggle for complex types */}
              {isComplex ? (
                <button
                  type="button"
                  onClick={() => toggleField(k)}
                  className="w-5 h-5 flex items-center justify-center text-dark-4 hover:text-dark text-[10px] shrink-0"
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? "▶" : "▼"}
                </button>
              ) : (
                <span className="w-5 shrink-0" />
              )}

              {/* Key */}
              <code className="text-xs font-mono text-blue bg-blue/10 px-1.5 py-0.5 rounded shrink-0 max-w-[140px] truncate">
                {k}
              </code>

              {/* Type badge */}
              <span
                className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded shrink-0 ${ds.badge}`}
              >
                {type}
              </span>

              {/* Collapsed summary */}
              {isCollapsed && summary && (
                <span className="text-xs text-dark-4 truncate flex-1 min-w-0">
                  {summary}
                </span>
              )}
              {!isCollapsed && <span className="flex-1" />}

              {/* Remove */}
              <button
                type="button"
                title="Remove field"
                onClick={() => removeField(k)}
                className="w-6 h-6 flex items-center justify-center text-red hover:text-red-dark text-xs rounded shrink-0"
              >
                ✕
              </button>
            </div>

            {/* ── Field value (hidden when collapsed + complex) ─────── */}
            {(!isComplex || !isCollapsed) && (
              <div className="p-2.5">
                <SmartFieldEditor
                  value={v}
                  onChange={(updated) => onChange({ ...obj, [k]: updated })}
                  depth={depth + 1}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── Add field row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end pt-1.5 border-t border-gray-3/40">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-dark-4">
            Field key
          </label>
          <input
            className={inputClass}
            placeholder='e.g. "title"'
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-dark-4">Type</label>
          <select
            className={inputClass}
            value={newType}
            onChange={(e) => setNewType(e.target.value as NewValueKind)}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object {"{}"}</option>
            <option value="array">Array {"[]"}</option>
          </select>
        </div>
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            const trimmed = newKey.trim();
            if (!trimmed || trimmed in obj) return;
            const val = createValueByKind(newType);
            onChange({ ...obj, [trimmed]: val });
            setNewKey("");
            if (newType === "object" || newType === "array") {
              setCollapsed((prev) => {
                const next = new Set<string>();
                prev.forEach((k) => next.add(k));
                next.add(trimmed);
                return next;
              });
            }
          }}
          disabled={!newKey.trim() || newKey.trim() in obj}
        >
          + Add Field
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SmartFieldEditor – renders the correct input for any value shape
// ---------------------------------------------------------------------------
function SmartFieldEditor({
  value,
  onChange,
  depth = 0,
}: {
  value: any;
  onChange: (v: any) => void;
  depth?: number;
}) {
  const type = detectType(value);

  if (type === "string") {
    const s = value as string;
    const isLong = s.includes("\n") || s.length > 100;
    return isLong ? (
      <textarea
        className={`${inputClass} min-h-[80px]`}
        value={s}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        type="text"
        className={inputClass}
        value={s}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (type === "number") {
    return (
      <input
        type="number"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  if (type === "boolean") {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          className="w-4 h-4"
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-dark">{String(value)}</span>
      </label>
    );
  }

  if (type === "array") {
    const arr = Array.isArray(value) ? value : [];
    return <ArrayNodeEditor items={arr} onChange={onChange} depth={depth} />;
  }

  if (type === "object") {
    const obj =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return <ObjectNodeEditor obj={obj} onChange={onChange} depth={depth} />;
  }

  // Fallback – unknown shape, raw JSON
  return <JsonSubEditor value={value} onChange={onChange} />;
}

// ---------------------------------------------------------------------------
// ContentObjectEditor – edit a full content Record field-by-field
// ---------------------------------------------------------------------------
function ContentObjectEditor({
  content,
  onChange,
}: {
  content: Record<string, any>;
  onChange: (c: Record<string, any>) => void;
}) {
  // Delegate to ObjectNodeEditor at depth 0 — supports add / remove / collapse
  return <ObjectNodeEditor obj={content} onChange={onChange} depth={0} />;
}

// ---------------------------------------------------------------------------
// ContentFieldSummary – compact read-only table for the list view
// ---------------------------------------------------------------------------
function ContentFieldSummary({ content }: { content: Record<string, any> }) {
  const entries = Object.entries(content);
  if (!entries.length)
    return <p className="text-xs text-dark-4 italic">Empty.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left border-b border-gray-2">
            <th className="pb-1.5 pr-4 font-medium text-dark-4 w-[28%]">
              Field
            </th>
            <th className="pb-1.5 font-medium text-dark-4">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => {
            const isArr = Array.isArray(value);
            const isObj = !isArr && typeof value === "object" && value !== null;
            let preview = "";
            if (isArr) {
              preview =
                typeof value[0] === "object"
                  ? `${value.length} item${value.length !== 1 ? "s" : ""}`
                  : (value as any[]).map(String).slice(0, 4).join(", ");
            } else if (isObj) {
              preview = `{ ${Object.keys(value as object)
                .slice(0, 4)
                .join(", ")} }`;
            } else {
              preview = String(value ?? "");
            }
            return (
              <tr key={key} className="border-b border-gray-2/50 last:border-0">
                <td className="py-1.5 pr-4 align-top">
                  <code className="font-mono text-dark">{key}</code>
                </td>
                <td className="py-1.5 text-dark-4 max-w-[320px]">
                  {isArr ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-blue/10 text-blue text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap">
                        [{value.length}]
                      </span>
                      <span className="truncate">{preview}</span>
                    </span>
                  ) : isObj ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-gray-2 text-dark-4 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                        obj
                      </span>
                      <span className="truncate text-dark-4">{preview}</span>
                    </span>
                  ) : (
                    <span className="line-clamp-1">
                      {preview || <em>—</em>}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentPreview – styled visual preview for each known content key
// ---------------------------------------------------------------------------
function ContentPreview({
  contentKey,
  content,
}: {
  contentKey: string;
  content: Record<string, any>;
}) {
  const hasImage = typeof content.image === "string" && !!content.image;

  if (contentKey.startsWith("home.hero_main")) {
    const mainItem =
      Array.isArray(content.items) && content.items.length
        ? content.items[0]
        : content;
    const slideCount = Array.isArray(content.items) ? content.items.length : 1;
    const mainHasImage = typeof mainItem.image === "string" && !!mainItem.image;

    return (
      <div className="rounded-xl border border-gray-3 bg-gradient-to-r from-[#E5EAF4] to-white p-4 flex items-center gap-4">
        {mainHasImage && (
          <div className="shrink-0 w-16 h-16 relative">
            <Image
              src={mainItem.image}
              alt="hero"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <span className="text-blue font-bold text-xl">
            {mainItem.salePercent} OFF
          </span>
          <p className="font-semibold text-dark text-sm mt-0.5">
            {mainItem.title}
          </p>
          <p className="text-xs text-dark-4 line-clamp-2">
            {mainItem.description}
          </p>
          {mainItem.ctaLabel && (
            <span className="mt-2 inline-block text-xs bg-dark text-white px-3 py-1 rounded-md">
              {mainItem.ctaLabel}
            </span>
          )}
          <p className="text-[10px] text-dark-4 mt-1">
            {slideCount} slide{slideCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    );
  }

  if (contentKey.startsWith("home.hero_side")) {
    const cards = Array.isArray(content.cards) ? content.cards : [];
    return (
      <div className="flex flex-wrap gap-3">
        {cards.map((card: any, i: number) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-white border border-gray-3 p-3 flex-1 min-w-[160px]"
          >
            {card.image && (
              <div className="w-10 h-12 relative shrink-0">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-dark">{card.title}</p>
              <p className="text-[10px] text-dark-4">{card.caption}</p>
              <span className="text-xs text-red font-semibold">
                {card.price}
              </span>
              <span className="text-[10px] text-dark-4 line-through ml-1">
                {card.oldPrice}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentKey.startsWith("home.hero_feature")) {
    const items = Array.isArray(content.items) ? content.items : [];
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-gray-3 bg-white px-3 py-2 min-w-[155px]"
          >
            {item.img && (
              <div className="w-6 h-6 relative shrink-0">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-dark">{item.title}</p>
              <p className="text-[10px] text-dark-4">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contentKey.startsWith("home.promo")) {
    return (
      <div className="rounded-xl bg-[#F5F5F7] p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-dark-4">{content.subhead}</p>
          <p className="font-bold text-dark text-lg leading-tight">
            {content.headline}
          </p>
          <p className="text-xs text-dark-4 mt-0.5 line-clamp-2">
            {content.description}
          </p>
          {content.ctaLabel && (
            <span className="mt-2 inline-block text-xs bg-blue text-white px-3 py-1 rounded-md">
              {content.ctaLabel}
            </span>
          )}
        </div>
        {hasImage && (
          <div className="shrink-0 w-20 h-20 relative">
            <Image
              src={content.image}
              alt="promo"
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  if (contentKey.startsWith("home.countdown")) {
    return (
      <div className="rounded-xl bg-[#D0E9F3] p-4">
        <span className="text-blue text-xs font-semibold">{content.tag}</span>
        <p className="font-bold text-dark text-base mt-0.5">{content.title}</p>
        <p className="text-xs text-dark-4 mt-0.5 line-clamp-2">
          {content.description}
        </p>
        <div className="flex gap-2 mt-2">
          {["Days", "Hrs", "Min", "Sec"].map((l) => (
            <div key={l} className="flex flex-col items-center">
              <span className="w-10 h-10 flex items-center justify-center bg-white rounded-lg font-bold text-dark text-sm shadow-sm">
                00
              </span>
              <span className="text-[10px] text-dark-4 mt-0.5">{l}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-dark-4 mt-1.5">
          until {content.deadline}
        </p>
      </div>
    );
  }

  if (contentKey.startsWith("common.newsletter")) {
    return (
      <div className="rounded-xl bg-blue p-4 text-white">
        <p className="font-bold text-base">{content.title}</p>
        <p className="text-sm opacity-80 mt-0.5">{content.description}</p>
        <div className="flex gap-2 mt-2">
          <div className="flex-1 h-9 rounded-md bg-white/20 border border-white/30" />
          <span className="inline-flex items-center text-xs bg-white text-blue font-semibold px-4 rounded-md">
            {content.buttonLabel}
          </span>
        </div>
      </div>
    );
  }

  if (contentKey.startsWith("footer.contact")) {
    return (
      <div className="rounded-xl bg-gray-1 border border-gray-3 p-4 space-y-1.5">
        <p className="font-semibold text-dark text-sm">{content.title}</p>
        {content.address && (
          <p className="text-xs text-dark-4">📍 {content.address}</p>
        )}
        {content.phone && (
          <p className="text-xs text-dark-4">📞 {content.phone}</p>
        )}
        {content.email && (
          <p className="text-xs text-dark-4">✉ {content.email}</p>
        )}
      </div>
    );
  }

  if (contentKey.startsWith("header.menu")) {
    const items = Array.isArray(content.items) ? content.items : [];
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item: any, i: number) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-3 bg-white px-3 py-1 text-xs"
          >
            <span className="font-medium text-dark">{item.title}</span>
            <code className="text-dark-4 font-mono">{item.path}</code>
            {item.newTab && <span className="text-blue">↗</span>}
          </span>
        ))}
      </div>
    );
  }

  if (contentKey.startsWith("contact.info")) {
    return (
      <div className="rounded-xl bg-gray-1 border border-gray-3 p-4 space-y-1.5">
        {content.name && (
          <p className="font-semibold text-dark text-sm">{content.name}</p>
        )}
        {content.phone && (
          <p className="text-xs text-dark-4">📞 {content.phone}</p>
        )}
        {content.address && (
          <p className="text-xs text-dark-4">📍 {content.address}</p>
        )}
      </div>
    );
  }

  // Generic fallback
  return <ContentFieldSummary content={content} />;
}

// ---------------------------------------------------------------------------
// Mode toggle pill
// ---------------------------------------------------------------------------
function ModeToggle({
  mode,
  onForm,
  onJson,
}: {
  mode: "form" | "json";
  onForm: () => void;
  onJson: () => void;
}) {
  return (
    <div className="flex rounded-lg border border-gray-3 overflow-hidden text-xs">
      <button
        type="button"
        className={`px-3 py-1 transition ${mode === "form" ? "bg-dark text-white" : "text-dark-4 hover:bg-gray-1"}`}
        onClick={onForm}
      >
        Form
      </button>
      <button
        type="button"
        className={`px-3 py-1 transition ${mode === "json" ? "bg-dark text-white" : "text-dark-4 hover:bg-gray-1"}`}
        onClick={onJson}
      >
        JSON
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ContentTab
// ---------------------------------------------------------------------------
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
  // ── Add form
  const [addOpen, setAddOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState<Record<string, any>>({});
  const [addJsonText, setAddJsonText] = useState("{}");
  const [addJsonErr, setAddJsonErr] = useState("");
  const [addMode, setAddMode] = useState<"json" | "form">("json");
  const [addStatus, setAddStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ── List
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // ── Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState<Record<string, any>>({});
  const [editMode, setEditMode] = useState<"form" | "json">("form");
  const [editJsonText, setEditJsonText] = useState("{}");
  const [editJsonErr, setEditJsonErr] = useState("");
  const [editStatus, setEditStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const startEdit = (row: SiteContentRow) => {
    setEditingId(row.id);
    setEditTitle(row.title);
    const c = row.content || {};
    setEditContent(c);
    setEditJsonText(JSON.stringify(c, null, 2));
    setEditJsonErr("");
    setEditMode("form");
    setEditStatus(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStatus(null);
  };

  const filtered = siteContents.filter((c) =>
    `${c.key} ${c.title}`.toLowerCase().includes(search.toLowerCase()),
  );
  const { pageItems, totalPages, safePage } = paginate(filtered, currentPage);

  // Status banner
  const StatusBanner = ({
    status,
  }: {
    status: { type: "success" | "error"; msg: string };
  }) => (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        status.type === "success"
          ? "border-green/30 bg-green/10 text-green"
          : "border-red/30 bg-red/10 text-red"
      }`}
    >
      {status.msg}
    </div>
  );

  return (
    <div className={sectionCardClass}>
      <h3 className="font-medium text-lg mb-1">Site Content</h3>
      <p className="text-sm text-dark-4 mb-4">
        {siteContents.length} content block
        {siteContents.length === 1 ? "" : "s"}
      </p>

      {/* ── Add form (collapsible) ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-3 bg-gray-1/50 mb-5 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-dark hover:bg-gray-1 transition"
          onClick={() => setAddOpen((v) => !v)}
        >
          <span>+ Add New Content Block</span>
          <span className="text-dark-4 text-xs">{addOpen ? "▲" : "▼"}</span>
        </button>

        {addOpen && (
          <div className="border-t border-gray-3 p-4 space-y-4">
            {addStatus && <StatusBanner status={addStatus} />}

            {/* Key + Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-dark">
                  Key
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. home.hero_main"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-dark">
                  Title
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Home Hero Main Slide"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Content editor */}
            <div className="rounded-xl border border-gray-3 bg-white p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-dark-4">
                  Content Fields
                </p>
                <ModeToggle
                  mode={addMode}
                  onForm={() => {
                    if (addJsonErr) {
                      setAddStatus({
                        type: "error",
                        msg: "Fix JSON errors before switching to Form mode.",
                      });
                      return;
                    }
                    try {
                      setNewContent(JSON.parse(addJsonText));
                      setAddMode("form");
                    } catch {
                      setAddStatus({ type: "error", msg: "Invalid JSON." });
                    }
                  }}
                  onJson={() => setAddMode("json")}
                />
              </div>

              {addMode === "json" ? (
                <div className="space-y-1">
                  <textarea
                    className={`${inputClass} font-mono text-xs min-h-[140px]`}
                    placeholder={
                      '{\n  "title": "Hello World",\n  "ctaLabel": "Shop Now"\n}'
                    }
                    value={addJsonText}
                    onChange={(e) => {
                      setAddJsonText(e.target.value);
                      try {
                        setNewContent(JSON.parse(e.target.value));
                        setAddJsonErr("");
                      } catch {
                        setAddJsonErr("Invalid JSON");
                      }
                    }}
                  />
                  {addJsonErr && (
                    <p className="text-xs text-red">{addJsonErr}</p>
                  )}
                  <p className="text-xs text-dark-4">
                    Enter content as JSON, then switch to <strong>Form</strong>{" "}
                    mode for a visual editor.
                  </p>
                </div>
              ) : (
                <ContentObjectEditor
                  content={newContent}
                  onChange={(c) => {
                    setNewContent(c);
                    setAddJsonText(JSON.stringify(c, null, 2));
                  }}
                />
              )}
            </div>

            <button
              disabled={isSaving}
              className={primaryBtnClass}
              onClick={() => {
                if (!newKey.trim()) {
                  setAddStatus({ type: "error", msg: "Key is required." });
                  return;
                }
                if (!newTitle.trim()) {
                  setAddStatus({ type: "error", msg: "Title is required." });
                  return;
                }
                if (addJsonErr) {
                  setAddStatus({
                    type: "error",
                    msg: "Fix JSON errors before saving.",
                  });
                  return;
                }
                if (siteContents.some((s) => s.key === newKey.trim())) {
                  setAddStatus({
                    type: "error",
                    msg: `Key "${newKey.trim()}" already exists.`,
                  });
                  return;
                }
                saveAction(async () => {
                  if (!supabase) return;
                  const { error } = await supabase.from("site_content").insert({
                    key: newKey.trim(),
                    title: newTitle.trim(),
                    content: newContent,
                  });
                  if (error) throw error;
                  setAddStatus({
                    type: "success",
                    msg: "Content block added!",
                  });
                  setNewKey("");
                  setNewTitle("");
                  setNewContent({});
                  setAddJsonText("{}");
                  setAddOpen(false);
                });
              }}
            >
              {isSaving ? "Saving…" : "Add Content Block"}
            </button>
          </div>
        )}
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

      {/* ── Content list ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {pageItems.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-gray-3 bg-white overflow-hidden"
          >
            {editingId === c.id ? (
              /* ── Edit mode ─────────────────────────────────────────── */
              <div className="p-4 space-y-4">
                {editStatus && <StatusBanner status={editStatus} />}

                {/* Key badge (read-only) */}
                <div className="flex items-center gap-2 rounded-lg bg-gray-1 border border-gray-3 px-3 py-2">
                  <span className="text-xs text-dark-4">Key:</span>
                  <code className="text-xs text-blue font-mono">{c.key}</code>
                  <span className="ml-auto text-[10px] text-dark-4 bg-gray-2 px-1.5 py-0.5 rounded">
                    read-only
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-dark">
                    Title
                  </label>
                  <input
                    className={inputClass}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                {/* Content editor */}
                <div className="rounded-xl border border-gray-3 bg-gray-1/50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-dark-4">
                      Content Fields
                    </p>
                    <ModeToggle
                      mode={editMode}
                      onForm={() => {
                        if (editJsonErr) {
                          setEditStatus({
                            type: "error",
                            msg: "Fix JSON errors before switching.",
                          });
                          return;
                        }
                        try {
                          setEditContent(JSON.parse(editJsonText));
                          setEditMode("form");
                        } catch {
                          setEditStatus({
                            type: "error",
                            msg: "Invalid JSON.",
                          });
                        }
                      }}
                      onJson={() => {
                        setEditJsonText(JSON.stringify(editContent, null, 2));
                        setEditMode("json");
                      }}
                    />
                  </div>

                  {editMode === "form" ? (
                    <ContentObjectEditor
                      content={editContent}
                      onChange={(updated) => {
                        setEditContent(updated);
                        setEditJsonText(JSON.stringify(updated, null, 2));
                      }}
                    />
                  ) : (
                    <div className="space-y-1">
                      <textarea
                        className={`${inputClass} font-mono text-xs min-h-[160px]`}
                        value={editJsonText}
                        onChange={(e) => {
                          setEditJsonText(e.target.value);
                          try {
                            setEditContent(JSON.parse(e.target.value));
                            setEditJsonErr("");
                          } catch {
                            setEditJsonErr("Invalid JSON");
                          }
                        }}
                      />
                      {editJsonErr && (
                        <p className="text-xs text-red">{editJsonErr}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    className={primaryBtnClass}
                    disabled={isSaving}
                    onClick={() => {
                      if (!editTitle.trim()) {
                        setEditStatus({
                          type: "error",
                          msg: "Title is required.",
                        });
                        return;
                      }
                      if (editJsonErr) {
                        setEditStatus({
                          type: "error",
                          msg: "Fix JSON errors before saving.",
                        });
                        return;
                      }
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("site_content")
                          .update({
                            title: editTitle,
                            content: editContent,
                          })
                          .eq("id", c.id);
                        if (error) throw error;
                        setEditStatus({
                          type: "success",
                          msg: "Updated successfully!",
                        });
                        cancelEdit();
                      });
                    }}
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                  <button className={secondaryBtnClass} onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── Read mode ─────────────────────────────────────────── */
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-dark text-sm">{c.title}</p>
                    <code className="text-xs text-blue font-mono">{c.key}</code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-dark-4 border border-gray-3 rounded-lg px-3 py-1.5 hover:bg-gray-1 transition"
                      onClick={() =>
                        setPreviewId(previewId === c.id ? null : c.id)
                      }
                    >
                      {previewId === c.id ? "Hide Preview" : "Preview"}
                    </button>
                    <button
                      className={primaryBtnClass}
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </button>
                    {pendingDelete === `content-${c.id}` ? (
                      <>
                        <button
                          className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 disabled:opacity-60 transition"
                          disabled={isSaving}
                          onClick={() =>
                            saveAction(async () => {
                              if (!supabase) return;
                              const { error } = await supabase
                                .from("site_content")
                                .delete()
                                .eq("id", c.id);
                              if (error) throw error;
                              setPendingDelete(null);
                            })
                          }
                        >
                          Confirm Delete
                        </button>
                        <button
                          className={secondaryBtnClass}
                          onClick={() => setPendingDelete(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white hover:bg-red/90 disabled:opacity-60 transition"
                        disabled={isSaving}
                        onClick={() => setPendingDelete(`content-${c.id}`)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Field summary table */}
                <div className="px-4 py-3">
                  <ContentFieldSummary content={c.content || {}} />
                </div>

                {/* Preview panel */}
                {previewId === c.id && (
                  <div className="px-4 pb-4 border-t border-dashed border-gray-3 pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-dark-4 mb-3">
                      Rendered Preview
                    </p>
                    <ContentPreview
                      contentKey={c.key}
                      content={c.content || {}}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {!pageItems.length && (
          <p className="text-sm text-dark-4 py-6 text-center">
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
