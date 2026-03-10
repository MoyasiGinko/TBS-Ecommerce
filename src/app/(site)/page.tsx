import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiny Libaas by Zayd - Home",
  description:
    "Discover the world of Tiny Libaas by Zayd, where fashion meets comfort. Explore our exclusive collection of stylish and cozy clothing designed to elevate your wardrobe. Shop now and experience the perfect blend of style and comfort with Tiny Libaas by Zayd.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
