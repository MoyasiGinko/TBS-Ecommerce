import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Blog Grid with Sidebar",
  description:
    "Explore the latest fashion trends and style tips with Tiny Libaas by Zayd's Blog Grid with Sidebar. Stay updated on the newest collections, fashion advice, and exclusive offers. Dive into our blog for inspiration and elevate your wardrobe with Tiny Libaas by Zayd.",
  // other metadata
};

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
