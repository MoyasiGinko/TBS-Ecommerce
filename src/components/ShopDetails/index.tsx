"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { getProductByIdClient } from "@/lib/data/store";
import { emptyProduct, Product } from "@/types/product";

const tabs = [
  { id: "description", title: "Description" },
  { id: "additional", title: "Additional Information" },
  { id: "reviews", title: "Reviews" },
];

const normalizeProduct = (value: any): Product | null => {
  if (!value || !value.id) return null;

  return {
    ...emptyProduct,
    ...value,
    colors: Array.isArray(value.colors) ? value.colors : [],
    highlights: Array.isArray(value.highlights) ? value.highlights : [],
    additionalInformation: Array.isArray(value.additionalInformation)
      ? value.additionalInformation
      : [],
    storageOptions: Array.isArray(value.storageOptions)
      ? value.storageOptions
      : [],
    typeOptions: Array.isArray(value.typeOptions) ? value.typeOptions : [],
    simOptions: Array.isArray(value.simOptions) ? value.simOptions : [],
    imgs: {
      thumbnails: Array.isArray(value.imgs?.thumbnails)
        ? value.imgs.thumbnails
        : [],
      previews: Array.isArray(value.imgs?.previews) ? value.imgs.previews : [],
    },
  };
};

const ratingStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => index < Math.round(rating));

const ShopDetails = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();
  const productFromRedux = useAppSelector(
    (state) => state.productDetailsReducer.value,
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSim, setSelectedSim] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        console.log(
          "Loading product..., searchParams:",
          Object.fromEntries(searchParams.entries()),
        );

        const productId = searchParams.get("id");
        console.log("Product ID from URL:", productId);

        if (productId) {
          console.log("Fetching from Supabase with ID:", productId);
          const fetchedProduct = await getProductByIdClient(productId);
          console.log("Supabase response:", fetchedProduct);

          if (fetchedProduct) {
            console.log("Fetched product successfully:", fetchedProduct.title);
            setProduct(fetchedProduct);
            localStorage.setItem(
              "productDetails",
              JSON.stringify(fetchedProduct),
            );
            dispatch(updateproductDetails(fetchedProduct));
            setIsLoading(false);
            return;
          }
        }

        console.log("Falling back to local storage or Redux...");
        const storedProduct = localStorage.getItem("productDetails");
        const fallbackProduct = normalizeProduct(
          storedProduct ? JSON.parse(storedProduct) : productFromRedux,
        );

        console.log(
          "Using fallback product:",
          fallbackProduct?.title || "NO PRODUCT",
        );
        setProduct(fallbackProduct);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(normalizeProduct(productFromRedux));
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (!product) return;
    setPreviewIndex(0);
    setQuantity(1);
    setSelectedColor(product.colors[0] || "");
    setSelectedStorage(product.storageOptions[0]?.id || "");
    setSelectedType(product.typeOptions[0]?.id || "");
    setSelectedSim(product.simOptions[0]?.id || "");
  }, [product]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.imgs.previews.length
      ? product.imgs.previews
      : product.imgs.thumbnails;
  }, [product]);

  const handlePreviewSlider = () => {
    if (!product) return;
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addItemToCart({
        ...product,
        quantity,
      }),
    );
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    dispatch(
      addItemToWishlist({
        ...product,
        quantity: 1,
        status: product.availability,
      }),
    );
  };

  if (isLoading) {
    return (
      <>
        <Breadcrumb title={"Shop Details"} pages={["shop details"]} />
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <p>Loading product...</p>
          </div>
        </section>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Breadcrumb title={"Shop Details"} pages={["shop details"]} />
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <p>Product not found.</p>
          </div>
        </section>
      </>
    );
  }

  const mainImage = gallery[previewIndex] || product.imgs.thumbnails[0] || "";

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-8 xl:gap-16">
            <div>
              <div className="relative rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 min-h-[420px] flex items-center justify-center">
                <button
                  onClick={handlePreviewSlider}
                  aria-label="Open image preview"
                  className="gallery__Image w-11 h-11 rounded-[5px] bg-white shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z"
                      fill=""
                    />
                  </svg>
                </button>

                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.title}
                    width={430}
                    height={430}
                    className="object-contain"
                  />
                ) : (
                  <div className="text-dark-4">No product image</div>
                )}
              </div>

              {gallery.length > 0 && (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
                  {gallery.map((image, index) => (
                    <button
                      key={`${product.id}-thumb-${index}`}
                      onClick={() => setPreviewIndex(index)}
                      className={`rounded-lg border p-2 bg-white ${
                        previewIndex === index ? "border-blue" : "border-gray-3"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        width={84}
                        height={84}
                        className="h-20 w-20 object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              {product.badge && (
                <span className="inline-flex rounded-full bg-green px-3 py-1 text-xs font-medium text-white mb-4">
                  {product.badge}
                </span>
              )}

              <h1 className="font-semibold text-2xl xl:text-heading-5 text-dark mb-3">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {ratingStars(product.rating).map((filled, index) => (
                      <svg
                        key={`${product.id}-star-${index}`}
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={filled ? "fill-[#FFA645]" : "fill-gray-4"}
                      >
                        <path
                          d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                          fill=""
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-dark">
                    {product.rating.toFixed(1)} rating ({product.reviews}{" "}
                    reviews)
                  </span>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-green">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green" />
                  {product.availability}
                </span>
              </div>

              <p className="text-dark-3 mb-6">{product.shortDescription}</p>

              <div className="flex items-end gap-3 mb-6">
                <span className="font-semibold text-dark text-2xl xl:text-heading-4">
                  ${product.discountedPrice}
                </span>
                {product.price !== product.discountedPrice && (
                  <span className="font-medium text-dark-4 text-lg line-through">
                    ${product.price}
                  </span>
                )}
              </div>

              {product.highlights.length > 0 && (
                <ul className="flex flex-col gap-2 mb-7">
                  {product.highlights.map((highlight, index) => (
                    <li
                      key={`${product.id}-highlight-${index}`}
                      className="flex items-center gap-2.5 text-dark"
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue/10 text-blue">
                        ✓
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-y border-gray-3 py-7 space-y-5">
                {product.colors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="min-w-[90px] font-medium text-dark">
                      Color:
                    </h4>
                    <div className="flex items-center gap-2.5">
                      {product.colors.map((color, index) => (
                        <button
                          key={`${product.id}-color-${index}`}
                          onClick={() => setSelectedColor(color)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            selectedColor === color
                              ? "border-dark"
                              : "border-transparent"
                          }`}
                          style={{
                            borderColor:
                              selectedColor === color ? color : "transparent",
                          }}
                          aria-label={`Select ${color}`}
                        >
                          <span
                            className="block h-4 w-4 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.storageOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="min-w-[90px] font-medium text-dark">
                      Storage:
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {product.storageOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedStorage(option.id)}
                          className={`rounded-md border px-4 py-2 text-sm ${
                            selectedStorage === option.id
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 bg-white text-dark"
                          }`}
                        >
                          {option.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.typeOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="min-w-[90px] font-medium text-dark">
                      Type:
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {product.typeOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedType(option.id)}
                          className={`rounded-md border px-4 py-2 text-sm ${
                            selectedType === option.id
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 bg-white text-dark"
                          }`}
                        >
                          {option.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.simOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4">
                    <h4 className="min-w-[90px] font-medium text-dark">Sim:</h4>
                    <div className="flex flex-wrap gap-3">
                      {product.simOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedSim(option.id)}
                          className={`rounded-md border px-4 py-2 text-sm ${
                            selectedSim === option.id
                              ? "border-blue bg-blue text-white"
                              : "border-gray-3 bg-white text-dark"
                          }`}
                        >
                          {option.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-7">
                <div className="flex items-center rounded-md border border-gray-3">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="flex h-12 w-12 items-center justify-center text-dark ease-out duration-200 hover:text-blue"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="flex h-12 w-16 items-center justify-center border-x border-gray-3 font-medium text-dark">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-dark ease-out duration-200 hover:text-blue"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className="inline-flex font-medium text-dark bg-white border border-gray-3 py-3 px-6 rounded-md ease-out duration-200 hover:bg-dark hover:text-white hover:border-dark"
                >
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                  activeTab === tab.id
                    ? "text-blue before:w-full"
                    : "text-dark before:w-0"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-xl bg-white shadow-1 p-6 sm:p-8">
                <h2 className="font-medium text-2xl text-dark mb-5">
                  Description
                </h2>
                <p className="text-dark-3 leading-7 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
              <div className="rounded-xl bg-white shadow-1 p-6 sm:p-8">
                <h2 className="font-medium text-2xl text-dark mb-5">
                  Care & Maintenance
                </h2>
                <p className="text-dark-3 leading-7 whitespace-pre-line mb-6">
                  {product.careInstructions ||
                    "No care instructions provided yet."}
                </p>
                <h3 className="font-medium text-xl text-dark mb-3">
                  Specifications Summary
                </h3>
                <p className="text-dark-3 leading-7 whitespace-pre-line">
                  {product.specificationSummary ||
                    "No specification summary provided yet."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "additional" && (
            <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10">
              {product.additionalInformation.length > 0 ? (
                product.additionalInformation.map((row, index) => (
                  <div
                    key={`${product.id}-info-${index}`}
                    className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5"
                  >
                    <div className="max-w-[450px] min-w-[140px] w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {row.label}
                      </p>
                    </div>
                    <div className="w-full">
                      <p className="text-sm sm:text-base text-dark">
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-dark-3">
                  No additional information provided yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="rounded-xl bg-white shadow-1 p-6 sm:p-8 mt-10">
              <h2 className="font-medium text-2xl text-dark mb-4">
                Customer Review Summary
              </h2>
              <p className="text-dark-3 leading-7">
                This product currently has a {product.rating.toFixed(1)} average
                rating from {product.reviews} customer reviews.
              </p>
              {product.promoText && (
                <p className="mt-4 text-dark font-medium">
                  {product.promoText}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <RecentlyViewdItems />
      <Newsletter />
    </>
  );
};

export default ShopDetails;
