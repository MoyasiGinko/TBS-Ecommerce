import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Cart",
  description: "View and manage your items in the cart at Tiny Libaas by Zayd.",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
