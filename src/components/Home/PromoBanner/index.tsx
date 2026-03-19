"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSiteContentMapClient } from "@/lib/data/siteContent";

type PromoContent = {
  headline?: string;
  subhead?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
};

const defaultPromo: PromoContent = {
  headline: "UP TO 40% OFF",
  subhead: "Women's Summer Collection",
  description:
    "Discover our latest summer essentials with premium fabrics and timeless styles.",
  ctaLabel: "Shop Now",
  ctaHref: "#",
  image: "/images/promo/promo-01.png",
};

const PromoBanner = () => {
  const [promo, setPromo] = useState<PromoContent>(defaultPromo);

  useEffect(() => {
    const loadContent = async () => {
      const contentMap = await getSiteContentMapClient();
      const managedPromo = contentMap["home.promo"];
      if (managedPromo) {
        setPromo({ ...defaultPromo, ...managedPromo });
      }
    };

    loadContent();
  }, []);

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              {promo.subhead}
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              {promo.headline}
            </h2>

            <p>{promo.description}</p>

            <a
              href={promo.ctaHref || "#"}
              className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
            >
              {promo.ctaLabel}
            </a>
          </div>

          <Image
            src={promo.image || defaultPromo.image!}
            alt="promo img"
            className="absolute bottom-0 right-4 lg:right-26 -z-1"
            width={274}
            height={350}
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
