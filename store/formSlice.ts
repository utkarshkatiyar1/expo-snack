// features/formSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { basicDeatilsParams,BillingCompanyParams } from "@/api/dsaOnboard";

// Define the initial state
interface FormState {
    basicData: basicDeatilsParams | null;
  billingData: Partial<BillingCompanyParams>; // Store incrementally
}

const initialState: FormState = {
  basicData: null,
  billingData: {}, // Start with an empty object for partial updates
};

// Create the slice
const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<basicDeatilsParams>) => {
      state.basicData = action.payload;
    },

    // Merge new billing data with existing state
    setBillingData: (state, action: PayloadAction<Partial<BillingCompanyParams>>) => {
      state.billingData = { ...state.billingData, ...action.payload };
    },

    resetFormData: (state) => {
      state.basicData = null;
    },

    resetBillingData: (state) => {
      state.billingData = {};
    },
  },
});

export const { setFormData, setBillingData, resetFormData, resetBillingData } = formSlice.actions;

export default formSlice.reducer;
