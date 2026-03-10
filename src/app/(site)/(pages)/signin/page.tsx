import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Signin",
  description:
    "Sign in to your Tiny Libaas by Zayd account to access your personalized shopping experience, manage your wishlist, and track your orders.",
  // other metadata
};

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
