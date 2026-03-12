import { ContentField, ProductDetailsForm } from "./types";
import { PAGE_SIZE } from "./constants";

export const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const toCsv = (value: any) =>
  Array.isArray(value) ? value.map((item) => String(item)).join(", ") : "";

export const toSelectedOptionIds = (value: any): string[] =>
  Array.isArray(value)
    ? value
        .map((item: any) =>
          String(item?.id || item?.title || item || "").trim(),
        )
        .filter(Boolean)
    : [];

export const inferStringValue = (value: any): string => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export const defaultProductDetails = (): ProductDetailsForm => ({
  rating: 4.7,
  category: "General",
  shortDescription: "",
  description: "",
  availability: "",
  badge: "",
  promoText: "",
  brand: "",
  model: "",
  colors: [],
  gender: [],
  highlights: "",
  specificationSummary: "",
  careInstructions: "",
  optionsGroup1: [],
  optionsGroup2: [],
  optionsGroup3: [],
  additionalInformation: "",
});

export const fromProductDetails = (
  details: Record<string, any>,
): ProductDetailsForm => {
  const additionalInformation = Array.isArray(details?.additionalInformation)
    ? details.additionalInformation
        .map((item: any) => {
          const label = String(item?.label || "").trim();
          const value = String(item?.value || "").trim();
          return label && value ? `${label}: ${value}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  return {
    rating: Number(details?.rating ?? 4.7),
    category: String(details?.category || ""),
    shortDescription: String(details?.shortDescription || ""),
    description: String(details?.description || ""),
    availability: String(details?.availability || ""),
    badge: String(details?.badge || ""),
    promoText: String(details?.promoText || ""),
    brand: String(details?.brand || ""),
    model: String(details?.model || ""),
    colors: toSelectedOptionIds(details?.colors),
    gender: toSelectedOptionIds(details?.gender),
    highlights: toCsv(details?.highlights),
    specificationSummary: String(details?.specificationSummary || ""),
    careInstructions: String(details?.careInstructions || ""),
    optionsGroup1: toSelectedOptionIds(details?.optionsGroup1),
    optionsGroup2: toSelectedOptionIds(details?.optionsGroup2),
    optionsGroup3: toSelectedOptionIds(details?.optionsGroup3),
    additionalInformation,
  };
};

export const toContentFields = (
  content: Record<string, any> | null | undefined,
): ContentField[] => {
  const source = content && typeof content === "object" ? content : {};
  const entries = Object.entries(source);
  if (!entries.length) {
    return [{ id: makeId(), key: "", value: "" }];
  }
  return entries.map(([key, value]) => ({
    id: makeId(),
    key,
    value: inferStringValue(value),
  }));
};

export const parseContentValue = (raw: string): any => {
  const value = raw.trim();
  if (!value) return "";
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return raw;
    }
  }
  return raw;
};

export const toContentPayload = (
  fields: ContentField[],
): Record<string, any> => {
  const payload: Record<string, any> = {};
  fields.forEach((field) => {
    const key = field.key.trim();
    if (!key) return;
    payload[key] = parseContentValue(field.value);
  });
  return payload;
};

export const paginate = <T>(items: T[], page: number, size = PAGE_SIZE) => {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  return {
    pageItems: items.slice(start, start + size),
    totalPages,
    safePage,
  };
};
