import { BlogItem } from "@/types/blogItem";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { Testimonial } from "@/types/testimonial";
import { Order } from "@/types/order";
import {
  fallbackBlogs,
  fallbackCategories,
  fallbackOrders,
  fallbackProducts,
  fallbackTestimonials,
} from "./fallback";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseLike = ReturnType<typeof createSupabaseServerClient>;

const PRODUCT_SELECT =
  "id,title,reviews,price,discounted_price,thumbnails,previews,details";

const normalizeOptionList = (
  value: any,
  fallback: { id: string; title: string }[],
) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          id: String(item?.id || item?.title || ""),
          title: String(item?.title || item?.id || ""),
        }))
        .filter((item) => item.id && item.title)
    : fallback;

const normalizeInfoRows = (
  value: any,
  fallback: { label: string; value: string }[],
) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          label: String(item?.label || ""),
          value: String(item?.value || ""),
        }))
        .filter((item) => item.label && item.value)
    : fallback;

const mapProduct = (row: any): Product => ({
  id: row.id,
  title: row.title,
  reviews: Number(row.reviews ?? 0),
  rating: Number(row.details?.rating ?? 4.7),
  price: Number(row.price ?? 0),
  discountedPrice: Number(row.discounted_price ?? row.price ?? 0),
  category: String(row.details?.category ?? "Electronics"),
  shortDescription: String(
    row.details?.shortDescription ??
      "A premium product sourced from the catalog with live pricing and images.",
  ),
  description: String(
    row.details?.description ??
      "This product is managed in the database and rendered consistently across the storefront.",
  ),
  availability: String(row.details?.availability ?? "In Stock"),
  badge: String(row.details?.badge ?? ""),
  promoText: String(row.details?.promoText ?? ""),
  brand: String(row.details?.brand ?? "TBS"),
  model: String(row.details?.model ?? row.title ?? ""),
  colors: Array.isArray(row.details?.colors)
    ? row.details.colors.map((item: any) => String(item)).filter(Boolean)
    : [],
  highlights: Array.isArray(row.details?.highlights)
    ? row.details.highlights.map((item: any) => String(item)).filter(Boolean)
    : [],
  specificationSummary: String(row.details?.specificationSummary ?? ""),
  careInstructions: String(row.details?.careInstructions ?? ""),
  additionalInformation: normalizeInfoRows(row.details?.additionalInformation, [
    { label: "Brand", value: String(row.details?.brand ?? "TBS") },
    { label: "Model", value: String(row.details?.model ?? row.title ?? "") },
    {
      label: "Category",
      value: String(row.details?.category ?? "Electronics"),
    },
  ]),
  storageOptions: normalizeOptionList(row.details?.storageOptions, []),
  typeOptions: normalizeOptionList(row.details?.typeOptions, []),
  simOptions: normalizeOptionList(row.details?.simOptions, []),
  imgs: {
    thumbnails: Array.isArray(row.thumbnails) ? row.thumbnails : [],
    previews: Array.isArray(row.previews) ? row.previews : [],
  },
});

const mapBlog = (row: any): BlogItem => ({
  date: row.date,
  views: row.views,
  title: row.title,
  img: row.img,
});

const mapCategory = (row: any): Category => ({
  id: row.id,
  title: row.title,
  img: row.img,
});

const mapTestimonial = (row: any): Testimonial => ({
  review: row.review,
  authorName: row.author_name,
  authorRole: row.author_role,
  authorImg: row.author_img,
});

const mapOrder = (row: any): Order => ({
  id: row.id,
  orderId: row.order_id,
  createdAt: row.created_at_label,
  status: row.status,
  total: row.total,
  title: row.title,
});

const resolveServer = (client?: SupabaseLike) =>
  client || createSupabaseServerClient();

export const getProducts = async (
  client?: SupabaseLike,
): Promise<Product[]> => {
  const supabase = resolveServer(client);
  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackProducts;
  return data.map(mapProduct);
};

export const getBlogs = async (client?: SupabaseLike): Promise<BlogItem[]> => {
  const supabase = resolveServer(client);
  if (!supabase) return fallbackBlogs;

  const { data, error } = await supabase
    .from("blogs")
    .select("id,title,date,views,img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackBlogs;
  return data.map(mapBlog);
};

export const getCategories = async (
  client?: SupabaseLike,
): Promise<Category[]> => {
  const supabase = resolveServer(client);
  if (!supabase) return fallbackCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("id,title,img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackCategories;
  return data.map(mapCategory);
};

export const getTestimonials = async (
  client?: SupabaseLike,
): Promise<Testimonial[]> => {
  const supabase = resolveServer(client);
  if (!supabase) return fallbackTestimonials;

  const { data, error } = await supabase
    .from("testimonials")
    .select("id,review,author_name,author_role,author_img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackTestimonials;
  return data.map(mapTestimonial);
};

export const getOrdersForCurrentUser = async (): Promise<Order[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return fallbackOrders;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id,order_id,created_at_label,status,total,title")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];
  return data.map(mapOrder);
};

export const getProductsClient = async (): Promise<Product[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackProducts;
  return data.map(mapProduct);
};

export const getBlogsClient = async (): Promise<BlogItem[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return fallbackBlogs;

  const { data, error } = await supabase
    .from("blogs")
    .select("id,title,date,views,img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackBlogs;
  return data.map(mapBlog);
};

export const getCategoriesClient = async (): Promise<Category[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return fallbackCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("id,title,img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackCategories;
  return data.map(mapCategory);
};

export const getTestimonialsClient = async (): Promise<Testimonial[]> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return fallbackTestimonials;

  const { data, error } = await supabase
    .from("testimonials")
    .select("id,review,author_name,author_role,author_img")
    .order("id", { ascending: true });

  if (error || !data?.length) return fallbackTestimonials;
  return data.map(mapTestimonial);
};

export const getProductById = async (
  id: string,
  client?: SupabaseLike,
): Promise<Product | null> => {
  const supabase = resolveServer(client);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapProduct(data);
};

export const getProductByIdClient = async (
  id: string,
): Promise<Product | null> => {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    console.error("Supabase client not initialized");
    return null;
  }

  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    console.error("Invalid product ID:", id);
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", numId)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  if (!data) {
    console.error("Product not found for ID:", numId);
    return null;
  }
  return mapProduct(data);
};
