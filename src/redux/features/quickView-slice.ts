import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { emptyProduct, Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState = {
  value: emptyProduct,
} as InitialState;

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: () => {
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
