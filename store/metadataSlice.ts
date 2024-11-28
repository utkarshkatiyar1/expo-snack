import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for metadata and city
interface Metadata {
    announcements: any[];
    bank_account_types: BankAccountType[];
    banks: Bank[];
    city: City[];
    company_types: CompanyType[];
    current_playstore_version: number;
    customer_support_number: string;
    employee_types: EmployeeType[];
    exclusive_offers: string[];
    external_dsa: ExternalDsa[];
    force_update: boolean;
    list_place_of_supply: PlaceOfSupply[];
    loan_types: LoanType[];
    minimum_supported_version: MinimumSupportedVersion;
    privacy_policy_url: string;
    state: State[];
    terms_and_conditions_url: string;
  }
  
  interface BankAccountType {
    display_name: string;
    name: string;
  }
  
  interface Bank {
    active: boolean;
    id: number;
    name: string;
  }
  
  interface City {
    active: boolean;
    id: number;
    name: string;
  }
  
  interface CompanyType {
    display_name: string;
    name: string;
  }
  
  interface EmployeeType {
    display_role: string;
    role: string;
  }
  
  interface ExternalDsa {
    id: number;
    name: string;
  }
  
  interface PlaceOfSupply {
    gst_code: string;
    name: string;
  }
  
  interface LoanType {
    absolute_revenue_commission_processed_by_ln: number;
    absolute_revenue_commission_processed_by_self: number;
    active: boolean;
    display_name: string;
    id: number;
    name: string;
  }
  
  interface MinimumSupportedVersion {
    android: number;
    ios: number;
  }
  
  interface State {
    id: number;
    name: string;
  }

// Define the initial state type
interface MetadataState {
  metaData: Metadata | null;
}

// Initial state
const initialState: MetadataState = {
  metaData: null,
};

// Create the slice
const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    // Action to set metadata in state
    setMetadata: (state, action: PayloadAction<Metadata>) => {
      state.metaData = action.payload;
    },
    // Action to clear metadata from state
    clearMetadata: (state) => {
      state.metaData = null;
    },
  },
});

// Export actions to be used in components
export const { setMetadata, clearMetadata } = metadataSlice.actions;

// Export the reducer to be added to the store
export default metadataSlice.reducer;
