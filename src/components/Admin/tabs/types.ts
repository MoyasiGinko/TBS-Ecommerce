export type AdminTab =
  | "products"
  | "enums"
  | "categories"
  | "blogs"
  | "testimonials"
  | "orders"
  | "users"
  | "content";

export type ProductRow = {
  id: number;
  title: string;
  reviews: number;
  price: number;
  discounted_price: number;
  thumbnails: string[];
  previews: string[];
  details: Record<string, any>;
};

export type CategoryRow = {
  id: number;
  title: string;
  img: string;
};

export type BlogRow = {
  id: number;
  title: string;
  date: string;
  views: number;
  img: string;
};

export type TestimonialRow = {
  id: number;
  review: string;
  author_name: string;
  author_role: string;
  author_img: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  order_id: string;
  created_at_label: string;
  status: "processing" | "delivered" | "on-hold";
  total: string;
  title: string;
};

export type SiteContentRow = {
  id: number;
  key: string;
  title: string;
  content: Record<string, any>;
};

export type EnumGroupKey =
  | "optionsGroup1"
  | "optionsGroup2"
  | "optionsGroup3"
  | "colors"
  | "gender"
  | "availability";

export type ProductDetailEnumRow = {
  id: number;
  enum_group: EnumGroupKey;
  option_id: string;
  option_title: string;
  sort_order: number;
};

export type ProductDetailsForm = {
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

export type ContentField = {
  id: string;
  key: string;
  value: string;
};

export type MultiSelectOption = {
  id: string;
  title: string;
};

export type SaveAction = (
  action: () => Promise<void>,
  options?: { onSuccess?: () => void },
) => Promise<void>;
