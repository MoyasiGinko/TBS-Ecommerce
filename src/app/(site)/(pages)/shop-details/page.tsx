import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Shop Details",
  description:
    "View detailed information about our products with Tiny Libaas by Zayd. Find everything you need at competitive prices.",
  // other metadata
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
