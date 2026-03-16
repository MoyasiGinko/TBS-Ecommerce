/**
 * Upserts all homepage site_content rows into the live Supabase database.
 * Run with:  node scripts/seed-site-content.mjs
 */
import { createClient } from "../node_modules/@supabase/supabase-js/dist/index.mjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency required)
const envPath = resolve(__dirname, "../.env");
const envText = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((p) => p.trim()))
    .filter(([k, v]) => k && v)
    .map(([k, ...rest]) => [k, rest.join("=")]),
);

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** All homepage + common site_content rows */
const rows = [
  {
    key: "header.menu",
    title: "Header Menu",
    content: {
      items: [
        { id: 1, title: "Popular", newTab: false, path: "/", hidden: false },
        {
          id: 2,
          title: "Shop",
          newTab: false,
          path: "/shop-with-sidebar",
          hidden: false,
        },
        {
          id: 3,
          title: "Contact",
          newTab: false,
          path: "/contact",
          hidden: false,
        },
        {
          id: 6,
          title: "Pages",
          newTab: false,
          path: "/",
          hidden: false,
          submenu: [
            {
              id: 61,
              title: "Shop With Sidebar",
              newTab: false,
              path: "/shop-with-sidebar",
              hidden: false,
            },
            {
              id: 62,
              title: "Shop Without Sidebar",
              newTab: false,
              path: "/shop-without-sidebar",
              hidden: false,
            },
            {
              id: 64,
              title: "Checkout",
              newTab: false,
              path: "/checkout",
              hidden: false,
            },
            {
              id: 65,
              title: "Cart",
              newTab: false,
              path: "/cart",
              hidden: false,
            },
            {
              id: 66,
              title: "Wishlist",
              newTab: false,
              path: "/wishlist",
              hidden: false,
            },
            {
              id: 67,
              title: "Sign in",
              newTab: false,
              path: "/signin",
              hidden: false,
            },
            {
              id: 68,
              title: "Sign up",
              newTab: false,
              path: "/signup",
              hidden: false,
            },
            {
              id: 69,
              title: "My Account",
              newTab: false,
              path: "/my-account",
              hidden: false,
            },
            {
              id: 70,
              title: "Contact",
              newTab: false,
              path: "/contact",
              hidden: false,
            },
            {
              id: 75,
              title: "Error",
              newTab: false,
              path: "/error",
              hidden: false,
            },
            {
              id: 63,
              title: "Mail Success",
              newTab: false,
              path: "/mail-success",
              hidden: false,
            },
          ],
        },
        {
          id: 7,
          title: "Blogs",
          newTab: false,
          path: "/",
          hidden: false,
          submenu: [
            {
              id: 71,
              title: "Blog Grid with sidebar",
              newTab: false,
              path: "/blogs/blog-grid-with-sidebar",
              hidden: false,
            },
            {
              id: 72,
              title: "Blog Grid",
              newTab: false,
              path: "/blogs/blog-grid",
              hidden: false,
            },
            {
              id: 73,
              title: "Blog details with sidebar",
              newTab: false,
              path: "/blogs/blog-details-with-sidebar",
              hidden: false,
            },
            {
              id: 74,
              title: "Blog details",
              newTab: false,
              path: "/blogs/blog-details",
              hidden: false,
            },
          ],
        },
      ],
    },
  },
  {
    key: "home.hero_main",
    title: "Home Hero Main Slide",
    content: {
      items: [
        {
          salePercent: "30%",
          title: "True Wireless Noise Cancelling Headphone",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          ctaLabel: "Shop Now",
          href: "/shop-with-sidebar",
          image: "/images/hero/hero-01.png",
        },
        {
          salePercent: "25%",
          title: "Apple iPhone 14 Plus",
          description:
            "Powerful performance with all-day battery life and a brilliant display.",
          ctaLabel: "View Product",
          href: "/shop-details",
          image: "/images/hero/hero-02.png",
        },
      ],
    },
  },
  {
    key: "home.hero_side",
    title: "Home Hero Side Cards",
    content: {
      cards: [
        {
          title: "iPhone 14 Plus & 14 Pro Max",
          caption: "limited time offer",
          price: "$699",
          oldPrice: "$999",
          image: "/images/hero/hero-02.png",
          href: "/shop-details",
        },
        {
          title: "Wireless Headphone",
          caption: "limited time offer",
          price: "$699",
          oldPrice: "$999",
          image: "/images/hero/hero-01.png",
          href: "/shop-details",
        },
      ],
    },
  },
  {
    key: "home.hero_feature",
    title: "Home Hero Features",
    content: {
      items: [
        {
          img: "/images/icons/icon-01.svg",
          title: "Free Shipping",
          description: "For all orders $200",
        },
        {
          img: "/images/icons/icon-02.svg",
          title: "1 & 1 Returns",
          description: "Cancellation after 1 day",
        },
        {
          img: "/images/icons/icon-03.svg",
          title: "100% Secure Payments",
          description: "Gurantee secure payments",
        },
        {
          img: "/images/icons/icon-04.svg",
          title: "24/7 Dedicated Support",
          description: "Anywhere & anytime",
        },
      ],
    },
  },
  {
    key: "home.promo",
    title: "Home Promo Banner",
    content: {
      headline: "UP TO 30% OFF",
      subhead: "Apple iPhone 14 Plus",
      description:
        "iPhone 14 has the same superspeedy chip that is in iPhone 13 Pro.",
      ctaLabel: "Buy Now",
      ctaHref: "#",
      image: "/images/promo/promo-01.png",
    },
  },
  {
    key: "home.countdown",
    title: "Home Countdown Banner",
    content: {
      deadline: "December, 31, 2026",
      tag: "Don\u2019t Miss!!",
      title: "Enhance Your Music Experience",
      description: "The Havit H206d is a wired PC headphone.",
      ctaLabel: "Check it Out!",
      ctaHref: "#",
      image: "/images/countdown/countdown-01.png",
    },
  },
  {
    key: "common.newsletter",
    title: "Newsletter Block",
    content: {
      title: "Don't Miss Out Latest Trends & Offers",
      description:
        "Register to receive news about the latest offers and discount codes.",
      buttonLabel: "Subscribe",
    },
  },
  {
    key: "footer.contact",
    title: "Footer Contact",
    content: {
      title: "Help & Support",
      address: "685 Market Street, Las Vegas, LA 95820, United States.",
      phone: "(+099) 532-786-9843",
      email: "support@example.com",
    },
  },
  {
    key: "contact.info",
    title: "Contact Page Info",
    content: {
      name: "Tiny Libaas Support",
      phone: "1234 567890",
      address: "7398 Smoke Ranch Road, Las Vegas, Nevada 89128",
    },
  },
];

async function main() {
  console.log(
    `Upserting ${rows.length} site_content rows into ${supabaseUrl}...`,
  );

  const { data, error } = await supabase
    .from("site_content")
    .upsert(rows, { onConflict: "key" })
    .select("key, title");

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log("Done! Upserted rows:");
  data.forEach((r) => console.log(`  ✓ [${r.key}] ${r.title}`));
}

main();
