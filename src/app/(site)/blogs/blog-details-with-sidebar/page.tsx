import React from "react";
import BlogDetailsWithSidebar from "@/components/BlogDetailsWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Blog Details with Sidebar",
  description:
    "Read more about the latest fashion trends and style tips with Tiny Libaas by Zayd's Blog Details with Sidebar. Stay updated on the newest collections, fashion advice, and exclusive offers. Dive into our blog for inspiration and elevate your wardrobe with Tiny Libaas by Zayd.",
  // other metadata
};

const BlogDetailsWithSidebarPage = () => {
  return (
    <main>
      <BlogDetailsWithSidebar />
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
