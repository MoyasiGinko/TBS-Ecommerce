import { BlogItem } from "@/types/blogItem";
import { Category } from "@/types/category";
import { emptyProduct, Product } from "@/types/product";
import { Testimonial } from "@/types/testimonial";
import { Order } from "@/types/order";

const defaultDetails = {
  rating: 4.7,
  category: "Electronics",
  shortDescription:
    "A premium product sourced from the catalog with live pricing, gallery images, and configurable options.",
  description:
    "This product is managed in the database and displayed consistently across the storefront, quick actions, and the product details page.",
  availability: "In Stock",
  badge: "SALE 20% OFF",
  promoText: "Sales 30% Off Use Code: PROMO30",
  brand: "TBS",
  model: "Standard",
  colors: ["#ef4444", "#3b82f6", "#f97316", "#ec4899"],
  highlights: ["Free delivery available", "Sales 30% Off Use Code: PROMO30"],
  specificationSummary:
    "Built for daily use with dependable performance, quality materials, and storefront-ready merchandising content.",
  careInstructions:
    "Handle with care, keep dry, and follow the included maintenance guidance to preserve finish and performance.",
  additionalInformation: [
    { label: "Brand", value: "TBS" },
    { label: "Model", value: "Standard" },
    { label: "Category", value: "Electronics" },
  ],
  storageOptions: [
    { id: "standard", title: "Standard" },
    { id: "premium", title: "Premium" },
  ],
  typeOptions: [
    { id: "regular", title: "Regular" },
    { id: "deluxe", title: "Deluxe" },
  ],
  simOptions: [
    { id: "default", title: "Default" },
    { id: "plus", title: "Plus" },
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
    title: "Havit HV-G69 USB Gamepad",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 1,
    brand: "Havit",
    category: "Gaming Accessories",
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
    title: "iPhone 14 Plus , 6/128GB",
    reviews: 5,
    rating: 4.9,
    price: 899.0,
    discountedPrice: 99.0,
    id: 2,
    brand: "Apple",
    category: "Smartphones",
    storageOptions: [
      { id: "128gb", title: "128 GB" },
      { id: "256gb", title: "256 GB" },
      { id: "512gb", title: "512 GB" },
    ],
    typeOptions: [
      { id: "active", title: "Active" },
      { id: "inactive", title: "Inactive" },
    ],
    simOptions: [
      { id: "dual", title: "Dual" },
      { id: "e-sim", title: "E Sim" },
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
    title: "Apple iMac M1 24-inch 2021",
    reviews: 5,
    price: 59.0,
    discountedPrice: 29.0,
    id: 3,
    brand: "Apple",
    category: "Desktop Computers",
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
    title: "MacBook Air M1 chip, 8/256GB",
    reviews: 6,
    price: 59.0,
    discountedPrice: 29.0,
    id: 4,
    brand: "Apple",
    category: "Laptops",
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
    title: "Apple Watch Ultra",
    reviews: 3,
    price: 99.0,
    discountedPrice: 29.0,
    id: 5,
    brand: "Apple",
    category: "Wearables",
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
    title: "Logitech MX Master 3 Mouse",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 6,
    brand: "Logitech",
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
    title: "Apple iPad Air 5th Gen - 64GB",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 7,
    brand: "Apple",
    category: "Tablets",
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
    title: "Asus RT Dual Band Router",
    reviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    id: 8,
    brand: "Asus",
    category: "Networking",
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
    title: "How to Start a Successful E-commerce Business",
    img: "/images/blog/blog-01.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 250000,
    title: "The Benefits of Regular Exercise for a Healthy Lifestyle",
    img: "/images/blog/blog-02.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 180000,
    title: "Exploring the Wonders of Modern Art: A Gallery Tour",
    img: "/images/blog/blog-03.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 50000,
    title: "The Ultimate Guide to Traveling on a Budget",
    img: "/images/blog/blog-04.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 120000,
    title: "Cooking Masterclass: Creating Delicious Italian Pasta",
    img: "/images/blog/blog-05.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 75000,
    title: "Tech Trends 2022: What's Changing in the Digital World",
    img: "/images/blog/blog-06.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 90000,
    title: "A Guide to Sustainable Living: Reduce, Reuse, Recycle",
    img: "/images/blog/blog-07.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 150000,
    title: "The Psychology of Happiness: Finding Joy in Everyday Life",
    img: "/images/blog/blog-08.jpg",
  },
  {
    date: "Mar 27, 2022",
    views: 60000,
    title: "Exploring National Parks: Natural Beauty and Adventure",
    img: "/images/blog/blog-09.jpg",
  },
];

export const fallbackCategories: Category[] = [
  { title: "Televisions", id: 1, img: "/images/categories/categories-01.png" },
  { title: "Laptop & PC", id: 2, img: "/images/categories/categories-02.png" },
  {
    title: "Mobile & Tablets",
    id: 3,
    img: "/images/categories/categories-03.png",
  },
  {
    title: "Games & Videos",
    id: 4,
    img: "/images/categories/categories-04.png",
  },
  {
    title: "Home Appliances",
    id: 5,
    img: "/images/categories/categories-05.png",
  },
  {
    title: "Health & Sports",
    id: 6,
    img: "/images/categories/categories-06.png",
  },
  { title: "Watches", id: 7, img: "/images/categories/categories-07.png" },
  { title: "Televisions", id: 8, img: "/images/categories/categories-04.png" },
];

export const fallbackTestimonials: Testimonial[] = [
  {
    review:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    authorName: "Davis Dorwart",
    authorImg: "/images/users/user-01.jpg",
    authorRole: "Serial Entrepreneur",
  },
  {
    review:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    authorName: "Wilson Dias",
    authorImg: "/images/users/user-02.jpg",
    authorRole: "Backend Developer",
  },
  {
    review:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula",
    authorName: "Miracle Exterm",
    authorImg: "/images/users/user-03.jpg",
    authorRole: "Serial Entrepreneur",
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
