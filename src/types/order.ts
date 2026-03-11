export type Order = {
  id: string;
  orderId: string;
  createdAt: string;
  status: "processing" | "delivered" | "on-hold";
  total: string;
  title: string;
};
