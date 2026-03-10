import React from "react";
import BlogGrid from "@/components/BlogGrid";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Blog Grid",
  description:
    "Explore the latest fashion trends and style tips with Tiny Libaas by Zayd's Blog Grid. Stay updated on the newest collections, fashion advice, and exclusive offers. Dive into our blog for inspiration and elevate your wardrobe with Tiny Libaas by Zayd.",
  // other metadata
};

const BlogGridPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogGridPage;
