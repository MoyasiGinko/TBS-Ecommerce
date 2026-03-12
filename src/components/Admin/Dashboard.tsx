"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile, signOutUser } from "@/lib/supabase/auth";
import { UserProfile } from "@/types/user";
import type {
  AdminTab,
  ProductRow,
  CategoryRow,
  BlogRow,
  TestimonialRow,
  OrderRow,
  SiteContentRow,
  ProductDetailEnumRow,
} from "./tabs/types";
import { headerCard } from "./tabs/constants";
import { ProductsTab } from "./tabs/ProductsTab";
import { EnumsTab } from "./tabs/EnumsTab";
import { CategoriesTab } from "./tabs/CategoriesTab";
import { BlogsTab } from "./tabs/BlogsTab";
import { TestimonialsTab } from "./tabs/TestimonialsTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { UsersTab } from "./tabs/UsersTab";
import { ContentTab } from "./tabs/ContentTab";

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

  const saveAction = async (
    action: () => Promise<void>,
    options?: { onSuccess?: () => void },
  ) => {
    setIsSaving(true);
    setMessage("");
    try {
      await action();
      await loadAll();
      options?.onSuccess?.();
    } catch (error: any) {
      setMessage(error?.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

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
        <ProductsTab
          products={products}
          categories={categories}
          productDetailEnums={productDetailEnums}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "enums" && (
        <EnumsTab
          productDetailEnums={productDetailEnums}
          setProductDetailEnums={setProductDetailEnums}
          supabase={supabase}
        />
      )}

      {activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "blogs" && (
        <BlogsTab
          blogs={blogs}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "testimonials" && (
        <TestimonialsTab
          testimonials={testimonials}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "orders" && (
        <OrdersTab
          orders={orders}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "users" && (
        <UsersTab
          users={users}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}

      {activeTab === "content" && (
        <ContentTab
          siteContents={siteContents}
          isSaving={isSaving}
          supabase={supabase}
          saveAction={saveAction}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
