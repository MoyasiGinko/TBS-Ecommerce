"use client";

import React, { useEffect, useState } from "react";
import { getSiteContentMapClient } from "@/lib/data/siteContent";

type FooterContactContent = {
  title?: string;
  address?: string;
  phone?: string;
  email?: string;
};

const defaultFooter: FooterContactContent = {
  title: "Help & Support",
  address: "685 Market Street, Las Vegas, LA 95820, United States.",
  phone: "(+099) 532-786-9843",
  email: "support@example.com",
};

const Footer = () => {
  const year = new Date().getFullYear();
  const [content, setContent] = useState<FooterContactContent>(defaultFooter);

  useEffect(() => {
    const loadFooter = async () => {
      const contentMap = await getSiteContentMapClient();
      const footerContent = contentMap["footer.contact"];
      if (footerContent) {
        setContent({ ...defaultFooter, ...footerContent });
      }
    };

    loadFooter();
  }, []);

  return (
    <footer className="overflow-hidden border-t border-gray-3 bg-white">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-dark">
              {content.title}
            </h2>
            <p className="mb-2">{content.address}</p>
            <p className="mb-1">{content.phone}</p>
            <p>{content.email}</p>
          </div>

          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-dark">Account</h2>
            <ul className="space-y-2">
              <li>
                <a href="/my-account" className="hover:text-blue">My Account</a>
              </li>
              <li>
                <a href="/signin" className="hover:text-blue">Login / Register</a>
              </li>
              <li>
                <a href="/cart" className="hover:text-blue">Cart</a>
              </li>
              <li>
                <a href="/wishlist" className="hover:text-blue">Wishlist</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-custom-1 font-medium text-dark">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <a href="/shop-with-sidebar" className="hover:text-blue">Shop</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue">Contact</a>
              </li>
              <li>
                <a href="/blogs/blog-grid" className="hover:text-blue">Blog</a>
              </li>
              <li>
                <a href="/admin" className="hover:text-blue">Admin</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-3 text-sm text-dark-4">
          Copyright {year}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
