import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Wishlist",
  description:
    "Manage your favorite products with Tiny Libaas by Zayd's Wishlist. Keep track of items you love and find them easily when you're ready to purchase.",
  // other metadata
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
