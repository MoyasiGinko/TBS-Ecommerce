"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSiteContentMapClient } from "@/lib/data/siteContent";

type FeatureItem = {
  img: string;
  title: string;
  description: string;
};

const defaultFeatures: FeatureItem[] = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Free Shipping",
    description: "For all orders $200",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "1 & 1 Returns",
    description: "Cancellation after 1 day",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "100% Secure Payments",
    description: "Gurantee secure payments",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "24/7 Dedicated Support",
    description: "Anywhere & anytime",
  },
];

const HeroFeature = () => {
  const [features, setFeatures] = useState<FeatureItem[]>(defaultFeatures);

  useEffect(() => {
    const loadContent = async () => {
      const contentMap = await getSiteContentMapClient();
      const managed = contentMap["home.hero_feature"];
      if (Array.isArray(managed?.items) && managed.items.length) {
        setFeatures(managed.items as FeatureItem[]);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-0">
      <div className="flex flex-wrap items-center gap-7.5 xl:gap-12.5 mt-10">
        {features.map((item, key) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-lg px-2 py-1.5"
          >
            <Image src={item.img} alt="icons" width={40} height={41} />

            <div>
              <h3 className="font-medium text-lg text-dark">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
