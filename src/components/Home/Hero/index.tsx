"use client";

import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { getSiteContentMapClient } from "@/lib/data/siteContent";

type HeroSideCard = {
  title: string;
  caption: string;
  price: string;
  oldPrice: string;
  image: string;
  href?: string;
};

const defaultCards: HeroSideCard[] = [
  {
    title: "iPhone 14 Plus & 14 Pro Max",
    caption: "limited time offer",
    price: "$699",
    oldPrice: "$999",
    image: "/images/hero/hero-02.png",
    href: "/shop-details",
  },
  {
    title: "Wireless Headphone",
    caption: "limited time offer",
    price: "$699",
    oldPrice: "$999",
    image: "/images/hero/hero-01.png",
    href: "/shop-details",
  },
];

const Hero = () => {
  const [cards, setCards] = useState<HeroSideCard[]>(defaultCards);

  useEffect(() => {
    const loadContent = async () => {
      const contentMap = await getSiteContentMapClient();
      const managedCards = contentMap["home.hero_side"]?.cards;
      if (Array.isArray(managedCards) && managedCards.length) {
        setCards(managedCards as HeroSideCard[]);
      }
    };

    loadContent();
  }, []);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {cards.slice(0, 2).map((card, idx) => (
                <a
                  key={`${card.title}-${idx}`}
                  href={card.href || "/shop-details"}
                  className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 block"
                >
                  <div className="flex items-center gap-14">
                    <div>
                      <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20">
                        {card.title}
                      </h2>

                      <div>
                        <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                          {card.caption}
                        </p>
                        <span className="flex items-center gap-3">
                          <span className="font-medium text-heading-5 text-red">
                            {card.price}
                          </span>
                          <span className="font-medium text-2xl text-dark-4 line-through">
                            {card.oldPrice}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={123}
                        height={161}
                      />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
