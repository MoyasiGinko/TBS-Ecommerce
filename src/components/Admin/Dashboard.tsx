"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile, signOutUser } from "@/lib/supabase/auth";
import { UserProfile } from "@/types/user";

type AdminTab =
  | "products"
  | "enums"
  | "categories"
  | "blogs"
  | "testimonials"
  | "orders"
  | "users"
  | "content";

type ProductRow = {
  id: number;
  title: string;
  reviews: number;
  price: number;
  discounted_price: number;
  thumbnails: string[];
  previews: string[];
  details: Record<string, any>;
};

type CategoryRow = {
  id: number;
  title: string;
  img: string;
};

type BlogRow = {
  id: number;
  title: string;
  date: string;
  views: number;
  img: string;
};

type TestimonialRow = {
  id: number;
  review: string;
  author_name: string;
  author_role: string;
  author_img: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  order_id: string;
  created_at_label: string;
  status: "processing" | "delivered" | "on-hold";
  total: string;
  title: string;
};

type SiteContentRow = {
  id: number;
  key: string;
  title: string;
  content: Record<string, any>;
};

type EnumGroupKey =
  | "optionsGroup1"
  | "optionsGroup2"
  | "optionsGroup3"
  | "colors"
  | "gender";

type ProductDetailEnumRow = {
  id: number;
  enum_group: EnumGroupKey;
  option_id: string;
  option_title: string;
  sort_order: number;
};

type ProductDetailsForm = {
  rating: number;
  category: string;
  shortDescription: string;
  description: string;
  availability: string;
  badge: string;
  promoText: string;
  brand: string;
  model: string;
  colors: string[];
  gender: string[];
  highlights: string;
  specificationSummary: string;
  careInstructions: string;
  optionsGroup1: string[];
  optionsGroup2: string[];
  optionsGroup3: string[];
  additionalInformation: string;
};

type ContentField = {
  id: string;
  key: string;
  value: string;
};

type MultiSelectOption = {
  id: string;
  title: string;
};

type CheckedMultiSelectProps = {
  label: string;
  value: string[];
  options: MultiSelectOption[];
  onChange: (nextValue: string[]) => void;
};

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
      return;
    }
    onChange([...value, id]);
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

const PAGE_SIZE = 6;

const defaultProductDetails = (): ProductDetailsForm => ({
  rating: 4.7,
  category: "General",
  shortDescription: "",
  description: "",
  availability: "In Stock",
  badge: "",
  promoText: "",
  brand: "",
  model: "",
  colors: [],
  gender: [],
  highlights: "",
  specificationSummary: "",
  careInstructions: "",
  optionsGroup1: [],
  optionsGroup2: [],
  optionsGroup3: [],
  additionalInformation: "",
});

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const toCsv = (value: any) =>
  Array.isArray(value) ? value.map((item) => String(item)).join(", ") : "";

const toSelectedOptionIds = (value: any) =>
  Array.isArray(value)
    ? value
        .map((item: any) =>
          String(item?.id || item?.title || item || "").trim(),
        )
        .filter(Boolean)
    : [];

const fromProductDetails = (
  details: Record<string, any>,
): ProductDetailsForm => {
  const additionalInformation = Array.isArray(details?.additionalInformation)
    ? details.additionalInformation
        .map((item: any) => {
          const label = String(item?.label || "").trim();
          const value = String(item?.value || "").trim();
          return label && value ? `${label}: ${value}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  return {
    rating: Number(details?.rating ?? 4.7),
    category: String(details?.category || ""),
    shortDescription: String(details?.shortDescription || ""),
    description: String(details?.description || ""),
    availability: String(details?.availability || "In Stock"),
    badge: String(details?.badge || ""),
    promoText: String(details?.promoText || ""),
    brand: String(details?.brand || ""),
    model: String(details?.model || ""),
    colors: toSelectedOptionIds(details?.colors),
    gender: toSelectedOptionIds(details?.gender),
    highlights: toCsv(details?.highlights),
    specificationSummary: String(details?.specificationSummary || ""),
    careInstructions: String(details?.careInstructions || ""),
    optionsGroup1: toSelectedOptionIds(details?.optionsGroup1),
    optionsGroup2: toSelectedOptionIds(details?.optionsGroup2),
    optionsGroup3: toSelectedOptionIds(details?.optionsGroup3),
    additionalInformation,
  };
};

const inferStringValue = (value: any) => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const toContentFields = (
  content: Record<string, any> | null | undefined,
): ContentField[] => {
  const source = content && typeof content === "object" ? content : {};
  const entries = Object.entries(source);
  if (!entries.length) {
    return [{ id: makeId(), key: "", value: "" }];
  }

  return entries.map(([key, value]) => ({
    id: makeId(),
    key,
    value: inferStringValue(value),
  }));
};

const parseContentValue = (raw: string) => {
  const value = raw.trim();
  if (!value) return "";

  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return raw;
    }
  }

  return raw;
};

const toContentPayload = (fields: ContentField[]) => {
  const payload: Record<string, any> = {};
  fields.forEach((field) => {
    const key = field.key.trim();
    if (!key) return;
    payload[key] = parseContentValue(field.value);
  });
  return payload;
};

const paginate = <T,>(items: T[], page: number, size = PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  return {
    pageItems: items.slice(start, start + size),
    totalPages,
    safePage,
  };
};

const AdminDashboard = () => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [productDetailEnums, setProductDetailEnums] = useState<
    ProductDetailEnumRow[]
  >([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [siteContents, setSiteContents] = useState<SiteContentRow[]>([]);

  const [newProduct, setNewProduct] = useState({
    title: "",
    reviews: 0,
    price: 0,
    discounted_price: 0,
    thumbnails: "",
    previews: "",
    details: defaultProductDetails(),
  });

  const [newCategory, setNewCategory] = useState({ title: "", img: "" });

  const [newEnumOptionByGroup, setNewEnumOptionByGroup] = useState<
    Record<EnumGroupKey, string>
  >({
    optionsGroup1: "",
    optionsGroup2: "",
    optionsGroup3: "",
    colors: "",
    gender: "",
  });

  const [newBlog, setNewBlog] = useState({
    title: "",
    date: "",
    views: 0,
    img: "",
  });

  const [newTestimonial, setNewTestimonial] = useState({
    review: "",
    author_name: "",
    author_role: "",
    author_img: "",
  });

  const [newOrder, setNewOrder] = useState({
    user_id: "",
    order_id: "",
    created_at_label: "",
    status: "processing" as OrderRow["status"],
    total: "$0",
    title: "",
  });

  const [newContent, setNewContent] = useState({
    key: "",
    title: "",
    fields: [{ id: makeId(), key: "", value: "" }] as ContentField[],
  });

  const [search, setSearch] = useState<Record<AdminTab, string>>({
    products: "",
    enums: "",
    categories: "",
    blogs: "",
    testimonials: "",
    orders: "",
    users: "",
    content: "",
  });

  const [page, setPage] = useState<Record<AdminTab, number>>({
    products: 1,
    enums: 1,
    categories: 1,
    blogs: 1,
    testimonials: 1,
    orders: 1,
    users: 1,
    content: 1,
  });

  const [editingId, setEditingId] = useState<string>("");
  const [editingDraft, setEditingDraft] = useState<Record<string, any>>({});

  const toArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const cleanEnumOptionId = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9#]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const loadAll = useCallback(async () => {
    if (!supabase) {
      setMessage("Supabase env is missing. Check .env.local");
      setIsLoading(false);
      return;
    }

    const currentProfile = await getCurrentProfile();
    setProfile(currentProfile);

    const canManage =
      currentProfile?.role === "admin" || currentProfile?.role === "manager";

    if (!canManage) {
      setIsLoading(false);
      return;
    }

    const [
      productsRes,
      enumsRes,
      categoriesRes,
      blogsRes,
      testimonialsRes,
      ordersRes,
      usersRes,
      siteContentRes,
    ] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,title,reviews,price,discounted_price,thumbnails,previews,details",
        )
        .order("id"),
      supabase
        .from("product_detail_enums")
        .select("id,enum_group,option_id,option_title,sort_order")
        .order("enum_group", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("option_title", { ascending: true }),
      supabase.from("categories").select("id,title,img").order("id"),
      supabase.from("blogs").select("id,title,date,views,img").order("id"),
      supabase
        .from("testimonials")
        .select("id,review,author_name,author_role,author_img")
        .order("id"),
      supabase
        .from("orders")
        .select("id,user_id,order_id,created_at_label,status,total,title")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id,email,full_name,role,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("site_content")
        .select("id,key,title,content")
        .order("key", { ascending: true }),
    ]);

    setProducts((productsRes.data || []) as ProductRow[]);
    setProductDetailEnums((enumsRes.data || []) as ProductDetailEnumRow[]);
    setCategories((categoriesRes.data || []) as CategoryRow[]);
    setBlogs((blogsRes.data || []) as BlogRow[]);
    setTestimonials((testimonialsRes.data || []) as TestimonialRow[]);
    setOrders((ordersRes.data || []) as OrderRow[]);
    setUsers(
      (usersRes.data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        createdAt: u.created_at,
      })),
    );
    setSiteContents((siteContentRes.data || []) as SiteContentRow[]);

    const firstError =
      productsRes.error ||
      enumsRes.error ||
      categoriesRes.error ||
      blogsRes.error ||
      testimonialsRes.error ||
      ordersRes.error ||
      usersRes.error ||
      siteContentRes.error;

    setMessage(firstError ? firstError.message : "");
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveAction = async (action: () => Promise<void>) => {
    setIsSaving(true);
    setMessage("");
    try {
      await action();
      await loadAll();
    } catch (error: any) {
      setMessage(error?.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (tab: AdminTab, value: string) => {
    setSearch((prev) => ({ ...prev, [tab]: value }));
    setPage((prev) => ({ ...prev, [tab]: 1 }));
  };

  const startEdit = (id: string, row: any) => {
    const isProduct = id.startsWith("product-");
    const isContent = id.startsWith("content-");

    setEditingId(id);
    setEditingDraft({
      ...row,
      details: isProduct ? fromProductDetails(row.details || {}) : row.details,
      fields: isContent ? toContentFields(row.content) : row.fields,
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDraft({});
  };

  const headerCard =
    "rounded-2xl border border-gray-3 bg-gradient-to-br from-white via-white to-gray-1 p-4 shadow-sm";
  const inputClass =
    "w-full rounded-xl border border-gray-3 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";
  const sectionCardClass =
    "rounded-2xl border border-gray-3 bg-white/90 p-4 sm:p-5 shadow-sm";
  const primaryBtnClass =
    "inline-flex items-center justify-center rounded-xl bg-dark px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue disabled:opacity-60";
  const secondaryBtnClass =
    "inline-flex items-center justify-center rounded-xl border border-gray-3 bg-gray-1 px-3 py-2 text-sm font-medium text-dark transition hover:bg-gray-2";

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.products.toLowerCase()),
  );
  const filteredEnums = productDetailEnums.filter((item) =>
    (item.option_title + item.option_id + item.enum_group)
      .toLowerCase()
      .includes(search.enums.toLowerCase()),
  );
  const filteredCategories = categories.filter((c) =>
    c.title.toLowerCase().includes(search.categories.toLowerCase()),
  );
  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.blogs.toLowerCase()),
  );
  const filteredTestimonials = testimonials.filter((t) =>
    (t.author_name + t.author_role)
      .toLowerCase()
      .includes(search.testimonials.toLowerCase()),
  );
  const filteredOrders = orders.filter((o) =>
    (o.order_id + o.title + o.status)
      .toLowerCase()
      .includes(search.orders.toLowerCase()),
  );
  const filteredUsers = users.filter((u) =>
    (u.email + u.fullName + u.role)
      .toLowerCase()
      .includes(search.users.toLowerCase()),
  );
  const filteredContents = siteContents.filter((c) =>
    (c.key + c.title + JSON.stringify(c.content || {}))
      .toLowerCase()
      .includes(search.content.toLowerCase()),
  );

  const productsPg = paginate(filteredProducts, page.products);
  const categoriesPg = paginate(filteredCategories, page.categories);
  const blogsPg = paginate(filteredBlogs, page.blogs);
  const testimonialsPg = paginate(filteredTestimonials, page.testimonials);
  const ordersPg = paginate(filteredOrders, page.orders);
  const usersPg = paginate(filteredUsers, page.users);
  const contentsPg = paginate(filteredContents, page.content);

  const selectOptions = (group: EnumGroupKey) =>
    productDetailEnums.filter((item) => item.enum_group === group);

  const optionGroups: Array<{
    key: "optionsGroup1" | "optionsGroup2" | "optionsGroup3";
    label: string;
  }> = [
    { key: "optionsGroup1", label: "Option Group 1" },
    { key: "optionsGroup2", label: "Option Group 2" },
    { key: "optionsGroup3", label: "Option Group 3" },
  ];

  const enumGroups: Array<{ key: EnumGroupKey; label: string }> = [
    { key: "optionsGroup1", label: "Option Group 1" },
    { key: "optionsGroup2", label: "Option Group 2" },
    { key: "optionsGroup3", label: "Option Group 3" },
    { key: "colors", label: "Colors" },
    { key: "gender", label: "Gender" },
  ];

  const toOptionObjects = (group: EnumGroupKey, selectedIds: string[]) => {
    const byId = new Map(
      selectOptions(group).map((item) => [item.option_id, item.option_title]),
    );
    return selectedIds.map((id) => ({ id, title: byId.get(id) || id }));
  };

  const toStringValues = (group: EnumGroupKey, selectedIds: string[]) => {
    const byId = new Map(
      selectOptions(group).map((item) => [item.option_id, item.option_title]),
    );
    return selectedIds.map((id) => byId.get(id) || id);
  };

  const buildProductDetailsPayload = (details: ProductDetailsForm) => ({
    rating: Number(details.rating || 0),
    category: details.category,
    shortDescription: details.shortDescription,
    description: details.description,
    availability: details.availability,
    badge: details.badge,
    promoText: details.promoText,
    brand: details.brand,
    model: details.model,
    colors: toStringValues("colors", details.colors),
    gender: toStringValues("gender", details.gender),
    highlights: details.highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    specificationSummary: details.specificationSummary,
    careInstructions: details.careInstructions,
    optionsGroup1: toOptionObjects("optionsGroup1", details.optionsGroup1),
    optionsGroup2: toOptionObjects("optionsGroup2", details.optionsGroup2),
    optionsGroup3: toOptionObjects("optionsGroup3", details.optionsGroup3),
    additionalInformation: details.additionalInformation
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();
        return {
          label: (label || "").trim(),
          value,
        };
      })
      .filter((item) => item.label && item.value),
  });

  const renderPager = (tab: AdminTab, totalPages: number) => (
    <div className="mt-4 flex items-center gap-2">
      <button
        className="px-3 py-1 rounded border border-gray-3 bg-white disabled:opacity-50"
        disabled={page[tab] <= 1}
        onClick={() => setPage((p) => ({ ...p, [tab]: p[tab] - 1 }))}
      >
        Prev
      </button>
      <p className="text-sm">
        Page {page[tab]} / {totalPages}
      </p>
      <button
        className="px-3 py-1 rounded border border-gray-3 bg-white disabled:opacity-50"
        disabled={page[tab] >= totalPages}
        onClick={() => setPage((p) => ({ ...p, [tab]: p[tab] + 1 }))}
      >
        Next
      </button>
    </div>
  );

  const renderSkeleton = () => (
    <div className="rounded-2xl border border-gray-3 bg-white p-6 sm:p-10 shadow-sm animate-pulse">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded bg-gray-2" />
          <div className="h-4 w-72 rounded bg-gray-2" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-gray-2" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-20 rounded-2xl bg-gray-2" />
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-10 w-24 rounded-xl bg-gray-2" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-24 rounded-2xl bg-gray-2" />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  if (!isAdmin) {
    return (
      <div className="rounded-xl bg-white shadow-1 p-6 sm:p-10">
        <h2 className="font-semibold text-xl text-dark mb-3">Access denied</h2>
        {profile ? (
          <p className="mb-2">
            Signed in as <strong>{profile.email}</strong> with role{" "}
            <strong>{profile.role}</strong>. Admin or manager role is required.
          </p>
        ) : (
          <p className="mb-2">No active session found. Please sign in again.</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          If your role was recently changed in Supabase, sign out and back in so
          the session reflects the update. If the problem persists, make sure
          you have run the latest <code>schema.sql</code> in your Supabase SQL
          editor — the RLS policies may need to be refreshed.
        </p>
        <a
          href="/signin"
          className="inline-block mt-4 font-medium text-custom-sm py-2.5 px-5 rounded-md bg-dark text-white hover:bg-blue"
        >
          Go to Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-3 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.08)] p-5 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-semibold text-xl sm:text-2xl text-dark">
            Admin Dashboard
          </h2>
          <p className="text-sm">
            Signed in as {profile?.email} ({profile?.role})
          </p>
        </div>

        <button
          className="inline-flex font-medium text-custom-sm py-2.5 px-5 rounded-md border border-gray-3 bg-gray-1 text-dark hover:bg-dark hover:text-white"
          onClick={async () => {
            await signOutUser();
            window.location.href = "/signin";
          }}
        >
          Sign out
        </button>
      </div>

      {message ? (
        <p className="text-red text-custom-sm mb-4">{message}</p>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-8 gap-3 mb-6">
        <div className={headerCard}>
          <p className="text-xs">Products</p>
          <p className="font-semibold text-xl">{products.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Enums</p>
          <p className="font-semibold text-xl">{productDetailEnums.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Categories</p>
          <p className="font-semibold text-xl">{categories.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Blogs</p>
          <p className="font-semibold text-xl">{blogs.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Testimonials</p>
          <p className="font-semibold text-xl">{testimonials.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Orders</p>
          <p className="font-semibold text-xl">{orders.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Users</p>
          <p className="font-semibold text-xl">{users.length}</p>
        </div>
        <div className={headerCard}>
          <p className="text-xs">Content</p>
          <p className="font-semibold text-xl">{siteContents.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["products", "Products"],
            ["enums", "Enums"],
            ["categories", "Categories"],
            ["blogs", "Blogs"],
            ["testimonials", "Testimonials"],
            ["orders", "Orders"],
            ["users", "Users"],
            ["content", "Content"],
          ] as Array<[AdminTab, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-md border ${
              activeTab === key
                ? "bg-blue text-white border-blue"
                : "bg-gray-1 text-dark border-gray-3"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">
            Products ({products.length})
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">
            <input
              className={inputClass}
              placeholder="Title"
              value={newProduct.title}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, title: e.target.value }))
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Reviews"
              value={newProduct.reviews}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  reviews: Number(e.target.value),
                }))
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, price: Number(e.target.value) }))
              }
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Discounted Price"
              value={newProduct.discounted_price}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  discounted_price: Number(e.target.value),
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Thumbnails comma separated"
              value={newProduct.thumbnails}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, thumbnails: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Previews comma separated"
              value={newProduct.previews}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, previews: e.target.value }))
              }
            />

            <input
              className={inputClass}
              type="number"
              step="0.1"
              placeholder="Rating"
              value={newProduct.details.rating}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, rating: Number(e.target.value) },
                }))
              }
            />
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
              {!newProduct.details.category ? (
                <option value="">Select category</option>
              ) : null}
              {categories.map((category) => (
                <option key={category.id} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Availability"
              value={newProduct.details.availability}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, availability: e.target.value },
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Brand"
              value={newProduct.details.brand}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, brand: e.target.value },
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Model / SKU"
              value={newProduct.details.model}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, model: e.target.value },
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Badge"
              value={newProduct.details.badge}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, badge: e.target.value },
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Promo text"
              value={newProduct.details.promoText}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, promoText: e.target.value },
                }))
              }
            />
            <input
              className={inputClass}
              placeholder="Highlights comma separated"
              value={newProduct.details.highlights}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, highlights: e.target.value },
                }))
              }
            />
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

            {optionGroups.map((group) => (
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
                    details: {
                      ...v.details,
                      [group.key]: nextValue,
                    },
                  }))
                }
              />
            ))}

            <textarea
              className={`${inputClass} md:col-span-2 min-h-[92px]`}
              placeholder="Short description"
              value={newProduct.details.shortDescription}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, shortDescription: e.target.value },
                }))
              }
            />
            <textarea
              className={`${inputClass} md:col-span-2 min-h-[92px]`}
              placeholder="Long description"
              value={newProduct.details.description}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, description: e.target.value },
                }))
              }
            />
            <textarea
              className={`${inputClass} md:col-span-2 min-h-[92px]`}
              placeholder="Specification summary"
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
            <textarea
              className={`${inputClass} md:col-span-2 min-h-[92px]`}
              placeholder="Care instructions"
              value={newProduct.details.careInstructions}
              onChange={(e) =>
                setNewProduct((v) => ({
                  ...v,
                  details: { ...v.details, careInstructions: e.target.value },
                }))
              }
            />
            <textarea
              className={`${inputClass} md:col-span-2 min-h-[110px]`}
              placeholder="Specifications / additional info (one per line: Label: Value)"
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
          <button
            disabled={isSaving}
            className={`${primaryBtnClass} mb-4`}
            onClick={() =>
              saveAction(async () => {
                if (!supabase) return;
                const { error } = await supabase.from("products").insert({
                  title: newProduct.title,
                  reviews: newProduct.reviews,
                  price: newProduct.price,
                  discounted_price: newProduct.discounted_price,
                  thumbnails: toArray(newProduct.thumbnails),
                  previews: toArray(newProduct.previews),
                  details: buildProductDetailsPayload(newProduct.details),
                });
                if (error) throw error;
                setNewProduct({
                  title: "",
                  reviews: 0,
                  price: 0,
                  discounted_price: 0,
                  thumbnails: "",
                  previews: "",
                  details: defaultProductDetails(),
                });
              })
            }
          >
            Add product
          </button>

          <input
            className={`${inputClass} mb-4`}
            placeholder="Search products"
            value={search.products}
            onChange={(e) => handleSearch("products", e.target.value)}
          />

          <div className="space-y-2">
            {productsPg.pageItems.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-gray-3 bg-white p-3 sm:p-4 flex items-center justify-between gap-3"
              >
                {editingId === `product-${p.id}` ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <input
                      className={inputClass}
                      type="number"
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
                      placeholder="Thumbnails comma separated"
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
                      placeholder="Previews comma separated"
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
                        (category) =>
                          category.title === editingDraft.details?.category,
                      ) ? (
                        <option value={editingDraft.details?.category}>
                          {editingDraft.details?.category}
                        </option>
                      ) : null}
                      {!editingDraft.details?.category ? (
                        <option value="">Select category</option>
                      ) : null}
                      {categories.map((category) => (
                        <option key={category.id} value={category.title}>
                          {category.title}
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
                    <input
                      className={inputClass}
                      placeholder="Availability"
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
                    />
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
                      placeholder="Highlights comma separated"
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

                    {optionGroups.map((group) => (
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
          </div>
          {renderPager("products", productsPg.totalPages)}
        </div>
      )}

      {activeTab === "enums" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">
            Product Detail Enum Options ({productDetailEnums.length})
          </h3>

          <input
            className={`${inputClass} mb-4`}
            placeholder="Search enum options"
            value={search.enums}
            onChange={(e) => handleSearch("enums", e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {enumGroups.map((group) => {
              const options = (
                search.enums ? filteredEnums : productDetailEnums
              )
                .filter((item) => item.enum_group === group.key)
                .sort((a, b) => a.option_title.localeCompare(b.option_title));

              return (
                <div
                  key={group.key}
                  className="rounded-xl border border-gray-3 bg-white p-4"
                >
                  <p className="font-medium text-dark mb-3">{group.label}</p>

                  <div className="mb-3 space-y-2">
                    {options.length ? (
                      options.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-gray-3 bg-gray-1 px-3 py-2"
                        >
                          <p className="text-sm text-dark">
                            {item.option_title}
                          </p>
                          <button
                            className="text-xs rounded-md border border-red px-2 py-1 text-red hover:bg-red hover:text-white"
                            onClick={() =>
                              saveAction(async () => {
                                if (!supabase) return;
                                const { error } = await supabase
                                  .from("product_detail_enums")
                                  .delete()
                                  .eq("id", item.id);
                                if (error) throw error;
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-dark-4">No options yet.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      placeholder={`Add ${group.label} option`}
                      value={newEnumOptionByGroup[group.key]}
                      onChange={(e) =>
                        setNewEnumOptionByGroup((prev) => ({
                          ...prev,
                          [group.key]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className={primaryBtnClass}
                      disabled={isSaving}
                      onClick={() =>
                        saveAction(async () => {
                          if (!supabase) return;
                          const optionTitle =
                            newEnumOptionByGroup[group.key].trim();
                          if (!optionTitle) return;
                          const optionId = cleanEnumOptionId(optionTitle);
                          const { error } = await supabase
                            .from("product_detail_enums")
                            .insert({
                              enum_group: group.key,
                              option_id: optionId,
                              option_title: optionTitle,
                            });
                          if (error) throw error;
                          setNewEnumOptionByGroup((prev) => ({
                            ...prev,
                            [group.key]: "",
                          }));
                        })
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">
            Categories ({categories.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="border rounded p-2"
              placeholder="Title"
              value={newCategory.title}
              onChange={(e) =>
                setNewCategory((v) => ({ ...v, title: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Image path"
              value={newCategory.img}
              onChange={(e) =>
                setNewCategory((v) => ({ ...v, img: e.target.value }))
              }
            />
          </div>
          <button
            disabled={isSaving}
            className="mb-4 inline-flex px-4 py-2 rounded bg-dark text-white"
            onClick={() =>
              saveAction(async () => {
                if (!supabase) return;
                const { error } = await supabase
                  .from("categories")
                  .insert(newCategory);
                if (error) throw error;
                setNewCategory({ title: "", img: "" });
              })
            }
          >
            Add category
          </button>

          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search categories"
            value={search.categories}
            onChange={(e) => handleSearch("categories", e.target.value)}
          />

          <div className="space-y-2">
            {categoriesPg.pageItems.map((c) => (
              <div
                key={c.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                {editingId === `category-${c.id}` ? (
                  <div className="w-full flex flex-wrap items-center gap-2">
                    <input
                      className="border rounded p-2"
                      value={editingDraft.title || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          title: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="border rounded p-2 flex-1"
                      value={editingDraft.img || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({ ...d, img: e.target.value }))
                      }
                    />
                    <button
                      className="px-3 py-1 rounded bg-blue text-white"
                      onClick={() =>
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
                          cancelEdit();
                        })
                      }
                    >
                      Save
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-gray-2"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p>{c.title}</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() => startEdit(`category-${c.id}`, c)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("categories")
                              .delete()
                              .eq("id", c.id);
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
          </div>
          {renderPager("categories", categoriesPg.totalPages)}
        </div>
      )}

      {activeTab === "blogs" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">Blogs ({blogs.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="border rounded p-2"
              placeholder="Title"
              value={newBlog.title}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, title: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Date label"
              value={newBlog.date}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, date: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              type="number"
              placeholder="Views"
              value={newBlog.views}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, views: Number(e.target.value) }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Image path"
              value={newBlog.img}
              onChange={(e) =>
                setNewBlog((v) => ({ ...v, img: e.target.value }))
              }
            />
          </div>
          <button
            className="mb-4 inline-flex px-4 py-2 rounded bg-dark text-white"
            disabled={isSaving}
            onClick={() =>
              saveAction(async () => {
                if (!supabase) return;
                const { error } = await supabase.from("blogs").insert(newBlog);
                if (error) throw error;
                setNewBlog({ title: "", date: "", views: 0, img: "" });
              })
            }
          >
            Add blog
          </button>

          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search blogs"
            value={search.blogs}
            onChange={(e) => handleSearch("blogs", e.target.value)}
          />

          <div className="space-y-2">
            {blogsPg.pageItems.map((b) => (
              <div
                key={b.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                {editingId === `blog-${b.id}` ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2">
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
                    <input
                      className={inputClass}
                      value={editingDraft.date || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({ ...d, date: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      type="number"
                      value={editingDraft.views || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          views: Number(e.target.value),
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      value={editingDraft.img || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({ ...d, img: e.target.value }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        className={primaryBtnClass}
                        onClick={() =>
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
                    <p>{b.title}</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() => startEdit(`blog-${b.id}`, b)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("blogs")
                              .delete()
                              .eq("id", b.id);
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
          </div>
          {renderPager("blogs", blogsPg.totalPages)}
        </div>
      )}

      {activeTab === "testimonials" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">
            Testimonials ({testimonials.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="border rounded p-2 md:col-span-2"
              placeholder="Review"
              value={newTestimonial.review}
              onChange={(e) =>
                setNewTestimonial((v) => ({ ...v, review: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Author name"
              value={newTestimonial.author_name}
              onChange={(e) =>
                setNewTestimonial((v) => ({
                  ...v,
                  author_name: e.target.value,
                }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Author role"
              value={newTestimonial.author_role}
              onChange={(e) =>
                setNewTestimonial((v) => ({
                  ...v,
                  author_role: e.target.value,
                }))
              }
            />
            <input
              className="border rounded p-2 md:col-span-2"
              placeholder="Author image"
              value={newTestimonial.author_img}
              onChange={(e) =>
                setNewTestimonial((v) => ({ ...v, author_img: e.target.value }))
              }
            />
          </div>
          <button
            className="mb-4 inline-flex px-4 py-2 rounded bg-dark text-white"
            disabled={isSaving}
            onClick={() =>
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
              })
            }
          >
            Add testimonial
          </button>

          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search testimonials"
            value={search.testimonials}
            onChange={(e) => handleSearch("testimonials", e.target.value)}
          />

          <div className="space-y-2">
            {testimonialsPg.pageItems.map((t) => (
              <div
                key={t.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                {editingId === `testimonial-${t.id}` ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      className={inputClass}
                      value={editingDraft.review || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          review: e.target.value,
                        }))
                      }
                    />
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
                    <div className="flex gap-2">
                      <button
                        className={primaryBtnClass}
                        onClick={() =>
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
                    <p>{t.author_name}</p>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() => startEdit(`testimonial-${t.id}`, t)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("testimonials")
                              .delete()
                              .eq("id", t.id);
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
          </div>
          {renderPager("testimonials", testimonialsPg.totalPages)}
        </div>
      )}

      {activeTab === "orders" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">Orders ({orders.length})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="border rounded p-2"
              placeholder="User ID (uuid)"
              value={newOrder.user_id}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, user_id: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Order code"
              value={newOrder.order_id}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, order_id: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Date label"
              value={newOrder.created_at_label}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, created_at_label: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Title"
              value={newOrder.title}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, title: e.target.value }))
              }
            />
            <select
              className="border rounded p-2"
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder((v) => ({
                  ...v,
                  status: e.target.value as OrderRow["status"],
                }))
              }
            >
              <option value="processing">processing</option>
              <option value="delivered">delivered</option>
              <option value="on-hold">on-hold</option>
            </select>
            <input
              className="border rounded p-2"
              placeholder="Total e.g. $100"
              value={newOrder.total}
              onChange={(e) =>
                setNewOrder((v) => ({ ...v, total: e.target.value }))
              }
            />
          </div>

          <button
            className="mb-4 inline-flex px-4 py-2 rounded bg-dark text-white"
            disabled={isSaving}
            onClick={() =>
              saveAction(async () => {
                if (!supabase) return;
                const { error } = await supabase
                  .from("orders")
                  .insert(newOrder);
                if (error) throw error;
                setNewOrder({
                  user_id: "",
                  order_id: "",
                  created_at_label: "",
                  status: "processing",
                  total: "$0",
                  title: "",
                });
              })
            }
          >
            Add order
          </button>

          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search orders"
            value={search.orders}
            onChange={(e) => handleSearch("orders", e.target.value)}
          />

          <div className="space-y-2">
            {ordersPg.pageItems.map((o) => (
              <div
                key={o.id}
                className="border rounded p-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">
                    {o.order_id} - {o.title}
                  </p>
                  <p className="text-sm">
                    {o.status} - {o.total}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue text-white"
                    onClick={() => startEdit(`order-${o.id}`, o)}
                  >
                    Edit
                  </button>
                  <select
                    className="border rounded p-1"
                    value={o.status}
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
                    <option value="processing">processing</option>
                    <option value="delivered">delivered</option>
                    <option value="on-hold">on-hold</option>
                  </select>
                  <button
                    className="px-3 py-1 rounded bg-red text-white"
                    onClick={() =>
                      saveAction(async () => {
                        if (!supabase) return;
                        const { error } = await supabase
                          .from("orders")
                          .delete()
                          .eq("id", o.id);
                        if (error) throw error;
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingId.startsWith("order-") ? (
            <div className="mt-4 border rounded p-4 bg-gray-1">
              <p className="font-medium mb-2">Edit order</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={editingDraft.user_id || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      user_id: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  value={editingDraft.order_id || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      order_id: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  value={editingDraft.title || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      title: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  value={editingDraft.created_at_label || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      created_at_label: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  value={editingDraft.total || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      total: e.target.value,
                    }))
                  }
                />
                <select
                  className={inputClass}
                  value={editingDraft.status || "processing"}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="processing">processing</option>
                  <option value="delivered">delivered</option>
                  <option value="on-hold">on-hold</option>
                </select>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className={primaryBtnClass}
                  onClick={() =>
                    saveAction(async () => {
                      if (!supabase) return;
                      const id = String(editingDraft.id || "");
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
                        .eq("id", id);
                      if (error) throw error;
                      cancelEdit();
                    })
                  }
                >
                  Save
                </button>
                <button className={secondaryBtnClass} onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {renderPager("orders", ordersPg.totalPages)}
        </div>
      )}

      {activeTab === "users" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">Users ({users.length})</h3>
          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search users"
            value={search.users}
            onChange={(e) => handleSearch("users", e.target.value)}
          />
          <div className="space-y-2">
            {usersPg.pageItems.map((u) => (
              <div
                key={u.id}
                className="border rounded p-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{u.fullName || "Unnamed"}</p>
                  <p className="text-sm">{u.email}</p>
                </div>
                <select
                  className="border rounded p-2"
                  value={u.role}
                  onChange={(e) =>
                    saveAction(async () => {
                      if (!supabase) return;
                      const { error } = await supabase
                        .from("profiles")
                        .update({ role: e.target.value })
                        .eq("id", u.id);
                      if (error) throw error;
                    })
                  }
                >
                  <option value="customer">customer</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
          {renderPager("users", usersPg.totalPages)}
        </div>
      )}

      {activeTab === "content" && (
        <div className={sectionCardClass}>
          <h3 className="font-medium text-lg mb-3">
            Site Content ({siteContents.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className={inputClass}
              placeholder="Key (e.g. home.hero_main)"
              value={newContent.key}
              onChange={(e) =>
                setNewContent((v) => ({ ...v, key: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Title"
              value={newContent.title}
              onChange={(e) =>
                setNewContent((v) => ({ ...v, title: e.target.value }))
              }
            />
            <div className="md:col-span-2 space-y-2 rounded-xl border border-gray-3 bg-gray-1/70 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-dark-4">
                Content fields
              </p>
              {newContent.fields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <input
                    className={inputClass}
                    placeholder="Field key"
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
                  <input
                    className={inputClass}
                    placeholder="Field value"
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
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white"
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
                    Remove
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
                Add field
              </button>
            </div>
          </div>

          <button
            disabled={isSaving}
            className={`${primaryBtnClass} mb-4`}
            onClick={() =>
              saveAction(async () => {
                if (!supabase) return;
                const { error } = await supabase.from("site_content").insert({
                  key: newContent.key,
                  title: newContent.title,
                  content: toContentPayload(newContent.fields),
                });
                if (error) throw error;
                setNewContent({
                  key: "",
                  title: "",
                  fields: [{ id: makeId(), key: "", value: "" }],
                });
              })
            }
          >
            Add content item
          </button>

          <input
            className={`${inputClass} mb-4`}
            placeholder="Search site content"
            value={search.content}
            onChange={(e) => handleSearch("content", e.target.value)}
          />

          <div className="space-y-2">
            {contentsPg.pageItems.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-gray-3 bg-white p-3"
              >
                {editingId === `content-${c.id}` ? (
                  <div className="grid grid-cols-1 gap-2">
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

                    {(editingDraft.fields || []).map((field: ContentField) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2"
                      >
                        <input
                          className={inputClass}
                          placeholder="Field key"
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
                        <input
                          className={inputClass}
                          placeholder="Field value"
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
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl bg-red px-3 py-2 text-sm font-medium text-white"
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
                          Remove
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
                      Add field
                    </button>

                    <div className="flex gap-2">
                      <button
                        className={primaryBtnClass}
                        onClick={() =>
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-dark">{c.title}</p>
                      <p className="text-xs text-dark-4 mb-2">{c.key}</p>
                      <pre className="text-xs bg-gray-1 rounded p-2 overflow-x-auto">
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
                      <button
                        className="px-3 py-1 rounded bg-red text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("site_content")
                              .delete()
                              .eq("id", c.id);
                            if (error) throw error;
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {renderPager("content", contentsPg.totalPages)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
