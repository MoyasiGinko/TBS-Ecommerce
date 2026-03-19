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
        {
          id: 1,
          title: "Women",
          newTab: false,
          path: "/shop-with-sidebar",
          hidden: false,
        },
        {
          id: 2,
          title: "Men",
          newTab: false,
          path: "/shop-with-sidebar",
          hidden: false,
        },
        {
          id: 3,
          title: "Kids",
          newTab: false,
          path: "/shop-with-sidebar",
          hidden: false,
        },
        {
          id: 4,
          title: "Accessories",
          newTab: false,
          path: "/shop-with-sidebar",
          hidden: false,
        },
        {
          id: 5,
          title: "Sale",
          newTab: false,
          path: "/shop-with-sidebar",
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
          salePercent: "40%",
          title: "New Season \u2014 Women\u2019s Collection",
          description:
            "Discover effortlessly chic styles crafted for the modern woman. Fresh cuts, soft fabrics, bold prints.",
          ctaLabel: "Shop Women",
          href: "/shop-with-sidebar",
          image: "/images/hero/hero-01.png",
        },
        {
          salePercent: "30%",
          title: "Sharp & Effortless \u2014 Men\u2019s Style Edit",
          description:
            "Elevate your everyday look with our curated menswear essentials. Smart, casual, and everything in between.",
          ctaLabel: "Shop Men",
          href: "/shop-with-sidebar",
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
          title: "Kids\u2019 New Arrivals",
          caption: "limited time offer",
          price: "$29",
          oldPrice: "$49",
          image: "/images/hero/hero-02.png",
          href: "/shop-with-sidebar",
        },
        {
          title: "Premium Accessories",
          caption: "limited time offer",
          price: "$59",
          oldPrice: "$89",
          image: "/images/hero/hero-01.png",
          href: "/shop-with-sidebar",
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
          description: "On all orders over $75",
        },
        {
          img: "/images/icons/icon-02.svg",
          title: "Easy 30-Day Returns",
          description: "Hassle-free exchanges & refunds",
        },
        {
          img: "/images/icons/icon-03.svg",
          title: "100% Secure Payments",
          description: "Your data is always safe",
        },
        {
          img: "/images/icons/icon-04.svg",
          title: "Style Advice",
          description: "Expert fashion guidance 24/7",
        },
      ],
    },
  },
  {
    key: "home.promo",
    title: "Home Promo Banner",
    content: {
      headline: "UP TO 40% OFF",
      subhead: "Women\u2019s Summer Collection",
      description:
        "Shop our curated end-of-season edit. Premium fabrics, contemporary cuts, unbeatable prices.",
      ctaLabel: "Shop the Sale",
      ctaHref: "/shop-with-sidebar",
      image: "/images/promo/promo-01.png",
    },
  },
  {
    key: "home.countdown",
    title: "Home Countdown Banner",
    content: {
      deadline: "2026-12-31T23:59:59Z",
      tag: "Don\u2019t Miss!!",
      title: "End of Season Sale \u2014 Final Hours",
      description:
        "Grab your favourite styles before they\u2019re gone. Up to 50% off Women\u2019s, Men\u2019s, Kids & Accessories.",
      ctaLabel: "Shop the Sale",
      ctaHref: "/shop-with-sidebar",
      image: "/images/countdown/countdown-01.png",
    },
  },
  {
    key: "common.newsletter",
    title: "Newsletter Block",
    content: {
      title: "Stay Ahead of the Trend",
      description:
        "Sign up for curated style picks, exclusive member offers, and early access to new collections.",
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
