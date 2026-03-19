import { BlogItem } from "@/types/blogItem";
import { Category } from "@/types/category";
import { emptyProduct, Product } from "@/types/product";
import { Testimonial } from "@/types/testimonial";
import { Order } from "@/types/order";

const defaultDetails = {
  rating: 4.7,
  category: "Fashion",
  shortDescription:
    "A premium fashion piece sourced from our curated collection with live pricing, gallery images, and configurable options.",
  description:
    "This product is managed in the database and displayed consistently across the storefront, quick actions, and the product details page.",
  availability: "In Stock",
  badge: "SALE 25% OFF",
  promoText: "Limited Time: 25% Off Use Code: STYLE25",
  brand: "Urban Loom",
  model: "Standard",
  colors: ["#111827", "#3C50E0", "#EF4444", "#F97316"],
  highlights: ["Free shipping on orders $75+", "30-day returns", "Premium quality fabric"],
  specificationSummary:
    "Crafted with quality materials and attention to detail for everyday wear and special occasions.",
  careInstructions:
    "Machine wash cold, hang dry, and follow garment care label for best results.",
  additionalInformation: [
    { label: "Brand", value: "Urban Loom" },
    { label: "Category", value: "Fashion" },
    { label: "Material", value: "Premium Blend" },
  ],
  optionsGroup1: [
    { id: "xs", title: "XS" },
    { id: "s", title: "S" },
    { id: "m", title: "M" },
    { id: "l", title: "L" },
    { id: "xl", title: "XL" },
  ],
  optionsGroup2: [
    { id: "regular", title: "Regular Fit" },
    { id: "slim", title: "Slim Fit" },
    { id: "oversized", title: "Oversized Fit" },
  ],
  optionsGroup3: [
    { id: "cotton", title: "Cotton" },
    { id: "denim", title: "Denim" },
    { id: "linen", title: "Linen" },
  ],
};

const createFallbackProduct = (
  product: Partial<Product> & {
    id: number;
    title: string;
    reviews: number;
    price: number;
    discountedPrice: number;
    imgs: Product["imgs"];
  },
): Product => ({
  ...emptyProduct,
  ...defaultDetails,
  ...product,
  model: product.title,
  additionalInformation: [
    { label: "Brand", value: product.brand || defaultDetails.brand },
    { label: "Model", value: product.title },
    { label: "Category", value: product.category || defaultDetails.category },
  ],
  imgs: {
    thumbnails: product.imgs?.thumbnails || [],
    previews: product.imgs?.previews || [],
  },
});

export const fallbackProducts: Product[] = [
  createFallbackProduct({
    title: "Floral Midi Dress",
    reviews: 42,
    rating: 4.8,
    price: 89.0,
    discountedPrice: 59.0,
    id: 1,
    brand: "Urban Loom",
    category: "Women's Fashion",
    imgs: {
      thumbnails: [
        "/images/products/product-1-sm-1.png",
        "/images/products/product-1-sm-2.png",
      ],
      previews: [
        "/images/products/product-1-bg-1.png",
        "/images/products/product-1-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Tailored Linen Blazer",
    reviews: 28,
    rating: 4.7,
    price: 129.0,
    discountedPrice: 99.0,
    id: 2,
    brand: "North Lane",
    category: "Men's Fashion",
    optionsGroup1: [
      { id: "s", title: "S" },
      { id: "m", title: "M" },
      { id: "l", title: "L" },
      { id: "xl", title: "XL" },
    ],
    optionsGroup2: [
      { id: "regular", title: "Regular Fit" },
      { id: "slim", title: "Slim Fit" },
    ],
    optionsGroup3: [
      { id: "linen", title: "Linen" },
    ],
    imgs: {
      thumbnails: [
        "/images/products/product-2-sm-1.png",
        "/images/products/product-2-sm-2.png",
      ],
      previews: [
        "/images/products/product-2-bg-1.png",
        "/images/products/product-2-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Kids Printed Hoodie Set",
    reviews: 37,
    rating: 4.6,
    price: 69.0,
    discountedPrice: 49.0,
    id: 3,
    brand: "Little Drift",
    category: "Kids' Wear",
    imgs: {
      thumbnails: [
        "/images/products/product-3-sm-1.png",
        "/images/products/product-3-sm-2.png",
      ],
      previews: [
        "/images/products/product-3-bg-1.png",
        "/images/products/product-3-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Classic Straight Jeans",
    reviews: 51,
    rating: 4.9,
    price: 79.0,
    discountedPrice: 55.0,
    id: 4,
    brand: "Denim Republic",
    category: "Men's Fashion",
    imgs: {
      thumbnails: [
        "/images/products/product-4-sm-1.png",
        "/images/products/product-4-sm-2.png",
      ],
      previews: [
        "/images/products/product-4-bg-1.png",
        "/images/products/product-4-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Leather Crossbody Bag",
    reviews: 33,
    rating: 4.8,
    price: 119.0,
    discountedPrice: 85.0,
    id: 5,
    brand: "Maison Vale",
    category: "Accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-5-sm-1.png",
        "/images/products/product-5-sm-2.png",
      ],
      previews: [
        "/images/products/product-5-bg-1.png",
        "/images/products/product-5-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Minimalist Analog Watch",
    reviews: 21,
    rating: 4.7,
    price: 149.0,
    discountedPrice: 109.0,
    id: 6,
    brand: "Chrona",
    category: "Accessories",
    imgs: {
      thumbnails: [
        "/images/products/product-6-sm-1.png",
        "/images/products/product-6-sm-2.png",
      ],
      previews: [
        "/images/products/product-6-bg-1.png",
        "/images/products/product-6-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Unisex Cotton Overshirt",
    reviews: 44,
    rating: 4.8,
    price: 74.0,
    discountedPrice: 52.0,
    id: 7,
    brand: "Threadline",
    category: "Unisex Fashion",
    imgs: {
      thumbnails: [
        "/images/products/product-7-sm-1.png",
        "/images/products/product-7-sm-2.png",
      ],
      previews: [
        "/images/products/product-7-bg-1.png",
        "/images/products/product-7-bg-2.png",
      ],
    },
  }),
  createFallbackProduct({
    title: "Running Sneakers Pro",
    reviews: 39,
    rating: 4.8,
    price: 99.0,
    discountedPrice: 69.0,
    id: 8,
    brand: "Stride Co",
    category: "Footwear",
    imgs: {
      thumbnails: [
        "/images/products/product-8-sm-1.png",
        "/images/products/product-8-sm-2.png",
      ],
      previews: [
        "/images/products/product-8-bg-1.png",
        "/images/products/product-8-bg-2.png",
      ],
    },
  }),
];

export const fallbackBlogs: BlogItem[] = [
  {
    date: "Mar 27, 2022",
    views: 300000,
    title: "2026 Women's Fashion Trends You Can Wear Every Day",
    img: "/images/blog/blog-01.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 250000,
    title: "Men's Capsule Wardrobe: 12 Pieces for 30 Looks",
    img: "/images/blog/blog-02.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 180000,
    title: "Kids Style Guide: Comfortable Outfits for School & Play",
    img: "/images/blog/blog-03.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 50000,
    title: "How to Choose the Perfect Bag for Work, Travel, and Weekends",
    img: "/images/blog/blog-04.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 120000,
    title: "Streetwear Meets Tailoring: The New Smart-Casual Formula",
    img: "/images/blog/blog-05.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 75000,
    title: "Accessory Layering 101: Watches, Belts, and Minimal Jewelry",
    img: "/images/blog/blog-06.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 90000,
    title: "Sustainable Fabrics Explained: Cotton, Linen, and Denim",
    img: "/images/blog/blog-07.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 150000,
    title: "How to Build Seasonal Looks on a Budget Without Compromise",
    img: "/images/blog/blog-08.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 60000,
    title: "Sneaker Styling Ideas for Women, Men, and Kids",
    img: "/images/blog/blog-09.jpg",
  },
];

export const fallbackCategories: Category[] = [
  { title: "Women's Fashion", id: 1, img: "/images/categories/categories-01.png" },
  { title: "Men's Fashion", id: 2, img: "/images/categories/categories-02.png" },
  {
    title: "Kids' Wear",
    id: 3,
    img: "/images/categories/categories-03.png",
  },
  {
    title: "Accessories",
    id: 4,
    img: "/images/categories/categories-04.png",
  },
  {
    title: "Footwear",
    id: 5,
    img: "/images/categories/categories-05.png",
  },
  {
    title: "Bags & Wallets",
    id: 6,
    img: "/images/categories/categories-06.png",
  },
  { title: "Activewear", id: 7, img: "/images/categories/categories-07.png" },
];

export const fallbackTestimonials: Testimonial[] = [
  {
    review:
      "I found complete family outfits on this platform! The variety spans from elegant dresses to casual kids wear. Quality is exceptional and delivery was incredibly fast.",
    authorName: "Amina Yusuf",
    authorImg: "/images/users/user-01.jpg",
    authorRole: "Fashion Entrepreneur",
  },
  {
    review:
      "The menswear edit is clean and versatile. The tailored blazer fits perfectly, and the jeans quality exceeds expectations. This is my go-to place for professional wardrobe pieces.",
    authorName: "Daniel Okoro",
    authorImg: "/images/users/user-02.jpg",
    authorRole: "Product Designer",
  },
  {
    review:
      "From kids sets to accessories and seasonal collections, everything I need in one place. The styling suggestions and curated collections make shopping so easy.",
    authorName: "Laila Mensah",
    authorImg: "/images/users/user-03.jpg",
    authorRole: "Lifestyle Creator",
  },
];

export const fallbackOrders: Order[] = [
  {
    id: "1",
    orderId: "234c56",
    createdAt: "18th May, 2022",
    status: "delivered",
    total: "$100",
    title: "Sunglasses",
  },
  {
    id: "2",
    orderId: "234c57",
    createdAt: "18th May, 2022",
    status: "processing",
    total: "$100",
    title: "Watchs",
  },
  {
    id: "3",
    orderId: "234c58",
    createdAt: "18th May, 2022",
    status: "on-hold",
    total: "$100",
    title: "Cancelled",
  },
];
