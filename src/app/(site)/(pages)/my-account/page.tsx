import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - My Account",
  description:
    "Manage your Tiny Libaas by Zayd account settings, view your order history, and update your personal information.",
  // other metadata
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
