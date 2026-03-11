import React from "react";

interface SkeletonLoaderProps {
  count?: number;
  type?: "product-card" | "category-card" | "blog-card";
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  type = "product-card",
  className = "",
}) => {
  if (type === "product-card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`animate-pulse w-full ${className}`}>
            <div className="bg-gray-3 rounded-lg min-h-[270px] w-full mb-4" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-3.5 w-3.5 bg-gray-3 rounded-full" />
                ))}
              </div>
              <div className="h-3 bg-gray-3 rounded w-12" />
            </div>
            <div className="h-4 bg-gray-3 rounded mb-1.5" />
            <div className="h-4 bg-gray-3 rounded w-4/5 mb-1.5" />
            <div className="flex gap-2">
              <div className="h-5 bg-gray-3 rounded w-20" />
              <div className="h-5 bg-gray-3 rounded w-16" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "category-card") {
    return (
      <div className={`flex gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse flex-shrink-0">
            <div className="bg-gray-3 rounded-full h-32 w-32 mb-3" />
            <div className="h-4 bg-gray-3 rounded w-24 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "blog-card") {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-3 rounded-lg h-48 w-full mb-4" />
            <div className="h-4 bg-gray-3 rounded mb-3" />
            <div className="h-4 bg-gray-3 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
