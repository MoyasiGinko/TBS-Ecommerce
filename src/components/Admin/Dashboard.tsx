"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile, signOutUser } from "@/lib/supabase/auth";
import { UserProfile } from "@/types/user";

type AdminTab =
  | "products"
  | "categories"
  | "blogs"
  | "testimonials"
  | "orders"
  | "users";

type ProductRow = {
  id: number;
  title: string;
  reviews: number;
  price: number;
  discounted_price: number;
  thumbnails: string[];
  previews: string[];
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

const PAGE_SIZE = 6;

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
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [newProduct, setNewProduct] = useState({
    title: "",
    reviews: 0,
    price: 0,
    discounted_price: 0,
    thumbnails: "",
    previews: "",
  });

  const [newCategory, setNewCategory] = useState({ title: "", img: "" });

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

  const [search, setSearch] = useState<Record<AdminTab, string>>({
    products: "",
    categories: "",
    blogs: "",
    testimonials: "",
    orders: "",
    users: "",
  });

  const [page, setPage] = useState<Record<AdminTab, number>>({
    products: 1,
    categories: 1,
    blogs: 1,
    testimonials: 1,
    orders: 1,
    users: 1,
  });

  const [editingId, setEditingId] = useState<string>("");
  const [editingDraft, setEditingDraft] = useState<Record<string, any>>({});

  const toArray = (value: string) =>
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

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
      categoriesRes,
      blogsRes,
      testimonialsRes,
      ordersRes,
      usersRes,
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id,title,reviews,price,discounted_price,thumbnails,previews")
        .order("id"),
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
    ]);

    setProducts((productsRes.data || []) as ProductRow[]);
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

    const firstError =
      productsRes.error ||
      categoriesRes.error ||
      blogsRes.error ||
      testimonialsRes.error ||
      ordersRes.error ||
      usersRes.error;

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
    setEditingId(id);
    setEditingDraft(row);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditingDraft({});
  };

  const headerCard =
    "rounded-xl border border-gray-3 bg-gradient-to-br from-white to-gray-1 p-4";

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.products.toLowerCase()),
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

  const productsPg = paginate(filteredProducts, page.products);
  const categoriesPg = paginate(filteredCategories, page.categories);
  const blogsPg = paginate(filteredBlogs, page.blogs);
  const testimonialsPg = paginate(filteredTestimonials, page.testimonials);
  const ordersPg = paginate(filteredOrders, page.orders);
  const usersPg = paginate(filteredUsers, page.users);

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

  if (isLoading) {
    return <p className="text-dark">Loading admin dashboard...</p>;
  }

  const isAdmin = profile?.role === "admin" || profile?.role === "manager";

  if (!isAdmin) {
    return (
      <div className="rounded-xl bg-white shadow-1 p-6 sm:p-10">
        <h2 className="font-semibold text-xl text-dark mb-3">Access denied</h2>
        <p>You must be signed in as an admin or manager to access this page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-1 p-6 sm:p-10">
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

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className={headerCard}>
          <p className="text-xs">Products</p>
          <p className="font-semibold text-xl">{products.length}</p>
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
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["products", "Products"],
            ["categories", "Categories"],
            ["blogs", "Blogs"],
            ["testimonials", "Testimonials"],
            ["orders", "Orders"],
            ["users", "Users"],
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
        <div>
          <h3 className="font-medium text-lg mb-3">
            Products ({products.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input
              className="border rounded p-2"
              placeholder="Title"
              value={newProduct.title}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, title: e.target.value }))
              }
            />
            <input
              className="border rounded p-2"
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
              className="border rounded p-2"
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, price: Number(e.target.value) }))
              }
            />
            <input
              className="border rounded p-2"
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
              className="border rounded p-2 md:col-span-2"
              placeholder="Thumbnails comma separated"
              value={newProduct.thumbnails}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, thumbnails: e.target.value }))
              }
            />
            <input
              className="border rounded p-2 md:col-span-2"
              placeholder="Previews comma separated"
              value={newProduct.previews}
              onChange={(e) =>
                setNewProduct((v) => ({ ...v, previews: e.target.value }))
              }
            />
          </div>
          <button
            disabled={isSaving}
            className="mb-4 inline-flex px-4 py-2 rounded bg-dark text-white"
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
                });
                if (error) throw error;
                setNewProduct({
                  title: "",
                  reviews: 0,
                  price: 0,
                  discounted_price: 0,
                  thumbnails: "",
                  previews: "",
                });
              })
            }
          >
            Add product
          </button>

          <input
            className="mb-4 w-full border rounded p-2"
            placeholder="Search products"
            value={search.products}
            onChange={(e) => handleSearch("products", e.target.value)}
          />

          <div className="space-y-2">
            {productsPg.pageItems.map((p) => (
              <div
                key={p.id}
                className="border rounded p-3 flex items-center justify-between gap-3"
              >
                {editingId === `product-${p.id}` ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2">
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
                      className="border rounded p-2"
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
                      className="border rounded p-2"
                      type="number"
                      value={editingDraft.discounted_price || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          discounted_price: Number(e.target.value),
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("products")
                              .update({
                                title: editingDraft.title,
                                price: editingDraft.price,
                                discounted_price: editingDraft.discounted_price,
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
                        className="px-3 py-1 rounded bg-gray-2"
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
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() => startEdit(`product-${p.id}`, p)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red text-white"
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

      {activeTab === "categories" && (
        <div>
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
        <div>
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
                      className="border rounded p-2"
                      value={editingDraft.date || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({ ...d, date: e.target.value }))
                      }
                    />
                    <input
                      className="border rounded p-2"
                      type="number"
                      value={editingDraft.views || 0}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          views: Number(e.target.value),
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("blogs")
                              .update({
                                title: editingDraft.title,
                                date: editingDraft.date,
                                views: editingDraft.views,
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
                        className="px-3 py-1 rounded bg-gray-2"
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
        <div>
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
                      className="border rounded p-2"
                      value={editingDraft.author_name || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          author_name: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="border rounded p-2"
                      value={editingDraft.author_role || ""}
                      onChange={(e) =>
                        setEditingDraft((d) => ({
                          ...d,
                          author_role: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="border rounded p-2"
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
                        className="px-3 py-1 rounded bg-blue text-white"
                        onClick={() =>
                          saveAction(async () => {
                            if (!supabase) return;
                            const { error } = await supabase
                              .from("testimonials")
                              .update({
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
                        className="px-3 py-1 rounded bg-gray-2"
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
        <div>
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
                  className="border rounded p-2"
                  value={editingDraft.order_id || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      order_id: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded p-2"
                  value={editingDraft.title || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      title: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded p-2"
                  value={editingDraft.created_at_label || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      created_at_label: e.target.value,
                    }))
                  }
                />
                <input
                  className="border rounded p-2"
                  value={editingDraft.total || ""}
                  onChange={(e) =>
                    setEditingDraft((d: any) => ({
                      ...d,
                      total: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-blue text-white"
                  onClick={() =>
                    saveAction(async () => {
                      if (!supabase) return;
                      const id = String(editingDraft.id || "");
                      const { error } = await supabase
                        .from("orders")
                        .update({
                          order_id: editingDraft.order_id,
                          title: editingDraft.title,
                          created_at_label: editingDraft.created_at_label,
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
                <button
                  className="px-3 py-1 rounded bg-gray-2"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {renderPager("orders", ordersPg.totalPages)}
        </div>
      )}

      {activeTab === "users" && (
        <div>
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
    </div>
  );
};

export default AdminDashboard;
