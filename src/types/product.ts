export type ProductOption = {
  id: string;
  title: string;
};

export type ProductInfoRow = {
  label: string;
  value: string;
};

export type Product = {
  id: number;
  title: string;
  reviews: number;
  rating: number;
  price: number;
  discountedPrice: number;
  category: string;
  shortDescription: string;
  description: string;
  availability: string;
  badge: string;
  promoText: string;
  brand: string;
  model: string;
  colors: string[];
  highlights: string[];
  specificationSummary: string;
  careInstructions: string;
  additionalInformation: ProductInfoRow[];
  optionsGroup1: ProductOption[];
  optionsGroup2: ProductOption[];
  optionsGroup3: ProductOption[];
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
};

export const emptyProduct: Product = {
  id: 0,
  title: "",
  reviews: 0,
  rating: 0,
  price: 0,
  discountedPrice: 0,
  category: "",
  shortDescription: "",
  description: "",
  availability: "In Stock",
  badge: "",
  promoText: "",
  brand: "",
  model: "",
  colors: [],
  highlights: [],
  specificationSummary: "",
  careInstructions: "",
  additionalInformation: [],
  optionsGroup1: [],
  optionsGroup2: [],
  optionsGroup3: [],
  imgs: {
    thumbnails: [],
    previews: [],
  },
};
