import BlogDetails from "@/components/BlogDetails";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Blog Details",
  description:
    "Read more about the latest fashion trends and style tips with Tiny Libaas by Zayd's Blog Details. Stay updated on the newest collections, fashion advice, and exclusive offers. Dive into our blog for inspiration and elevate your wardrobe with Tiny Libaas by Zayd.",
  // other metadata
};

const BlogDetailsPage = () => {
  return (
    <main>
      <BlogDetails />
    </main>
  );
};

export default BlogDetailsPage;
