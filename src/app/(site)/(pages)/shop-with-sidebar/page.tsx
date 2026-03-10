import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Shop With Sidebar",
  description:
    "Browse our wide selection of products with the help of our intuitive sidebar. Find everything you need at competitive prices with Tiny Libaas by Zayd.",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <ShopWithSidebar />
    </main>
  );
};

export default ShopWithSidebarPage;
