"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { getSiteContentMapClient } from "@/lib/data/siteContent";

type HeroMainSlide = {
  salePercent?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  href?: string;
  image?: string;
};

const defaultSlides: HeroMainSlide[] = [
  {
    salePercent: "30%",
    title: "True Wireless Noise Cancelling Headphone",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    ctaLabel: "Shop Now",
    href: "/shop-with-sidebar",
    ctaHref: "/shop-with-sidebar",
    image: "/images/hero/hero-01.png",
  },
  {
    salePercent: "25%",
    title: "Apple iPhone 14 Plus",
    description:
      "Powerful performance with all-day battery life and a brilliant display.",
    ctaLabel: "View Product",
    href: "/shop-details",
    ctaHref: "/shop-details",
    image: "/images/hero/hero-02.png",
  },
];

const normalizeSlide = (raw: any): HeroMainSlide => {
  const href = String(raw?.href || raw?.ctaHref || "/shop-with-sidebar");
  return {
    salePercent: String(raw?.salePercent || ""),
    title: String(raw?.title || ""),
    description: String(raw?.description || ""),
    ctaLabel: String(raw?.ctaLabel || "Shop Now"),
    href,
    ctaHref: href,
    image: String(raw?.image || defaultSlides[0].image),
  };
};

const HeroCarousal = () => {
  const [slides, setSlides] = useState<HeroMainSlide[]>(defaultSlides);

  useEffect(() => {
    const loadContent = async () => {
      const contentMap = await getSiteContentMapClient();
      const managed = contentMap["home.hero_main"];
      const managedItems = Array.isArray(managed?.items)
        ? managed.items
        : managed
          ? [managed]
          : [];

      if (managedItems.length) {
        setSlides(managedItems.map(normalizeSlide));
      }
    };

    loadContent();
  }, []);

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slides.map((slide, idx) => {
        const targetHref = slide.href || slide.ctaHref || "/shop-with-sidebar";
        const isExternal = targetHref.startsWith("http");
        return (
          <SwiperSlide key={`${slide.title || "hero"}-${idx}`}>
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                    {slide.salePercent}
                  </span>
                  <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                    Sale
                    <br />
                    Off
                  </span>
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <a
                    href={targetHref}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    {slide.title}
                  </a>
                </h1>

                <p>{slide.description}</p>

                <a
                  href={targetHref}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                >
                  {slide.ctaLabel}
                </a>
              </div>

              <div>
                <a
                  href={targetHref}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  <Image
                    src={slide.image || defaultSlides[0].image!}
                    alt={slide.title || "hero product"}
                    width={351}
                    height={358}
                  />
                </a>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroCarousal;
