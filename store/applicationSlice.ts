import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the types based on your interfaces
export interface Document {
  created_at: string| null;
  display_name: string| null;
  id: number|null;
  type: string| null;
  uploaded_by_type: string| null;
  url: string| null;
}

export interface Disbursement {
  pdd_cleared: boolean;
  category: string;
  additional_payout_percent: number | null;
  disbursement_type: string;
  notes: string | null;
  status: string;
  documents: Document[];
  has_additional_payout: boolean;
  display_disbursement_date: string;
  id: number;
  additional_payout: number | null;
  display_disbursement_amount: string;
  disputed_reason: string | null;
  updated_at: string;
  lead: string | null;
  otc_cleared: boolean;
  rejected_reason: string | null;
  branch_code: string | null;
  commission_on: string;
  display_acknowledgement_status: string;
  absolute_revenue_commission_unit: string;
  display_commission_amount: string | null;
  billing_company: string | null;
  display_category: string;
  disbursement_amount: number;
  display_disbursement_type: string;
  absolute_revenue_commission: number;
  loan_account_number: string;
  custom_rejected_reason: string;
  disbursement_date: string;
  acknowledgement_status: string | null;
  display_status: string;
  commission_amount: number | null;
}

export interface ExternalDsa {
  id: number | null;
  name: string | null;
}

export interface LoanAccountNumber {
  category: string;
  loan_account_number: string;
}

export interface LeadLoanType {
  display_name: string;
  id: number;
  name: string;
}

export interface Lead {
  action_on_lead_allowed: boolean;
  category: string | null;
  created_by_id: number;
  display_employment_type: string;
  display_loan_amount: string;
  display_status: string;
  dsa_id: number;
  employment_type: string;
  id: number;
  is_lead_deletable: boolean;
  is_lead_editable: boolean;
  loan_amount: number;
  loan_type: LeadLoanType;
  name: string;
  notes: string | null;
  pan: string;
  phone_number: string;
  processing_by: string;
  status: string;
  sub_loan_type: string | null;
}

export interface Update {
  created_at: number;
  display_amount: string;
  display_created_at: string;
  display_status: string;
  id: number;
  loan_account_number: string | null;
  otc_cleared: boolean | null;
  pdd_cleared: boolean | null;
  status: string;
}

export interface LendingPartner {
  active: boolean;
  commission_on: string;
  email_domains: string[];
  id: number;
  logo: string;
  name: string;
  order: number;
  slug: string | null;
  type: string;
}

export interface Application {
  disbursements: Disbursement[];
  add_disbursement: boolean;
  external_dsa: ExternalDsa;
  status: string;
  documents: Document[];
  is_from_external_dsa: boolean;
  is_application_deletable: boolean;
  logged_in_date: string;
  loan_account_numbers: LoanAccountNumber[];
  display_amount: string;
  id: number;
  external_dsa_bank_code: string | null;
  bank_rm_phone_number: string;
  updated_at: string;
  sanctioned_amount: number;
  bank_rm_name: string;
  lead_id: number;
  is_external_dsa_edit_allowed: boolean;
  los_id: string | null;
  lead: Lead;
  email_domains: string[];
  rejected_reason: string | null;
  branch_name: string;
  bank_rm_email_address: string;
  loan_insurance_added: boolean;
  display_sanctioned_amount: string;
  sanctioned_date: string;
  amount: number;
  display_sanctioned_date: string;
  display_loan_insurance_amount: string;
  display_commission_amount: string;
  bank_application_id: string;
  updates: Update[];
  loan_account_number: string;
  lending_partner: LendingPartner;
  custom_rejected_reason: string;
  loan_insurance_amount: number;
  display_status: string;
  commission_amount: number;
}

export interface LeadEdit {
  id: number;
  name: string;
  loan_type: LeadLoanType;
  is_lead_editable: boolean;
  is_lead_deletable: boolean;
  action_on_lead_allowed: boolean;
  display_loan_amount: string;
  loan_amount: number;
  count: number;
  pan: string;
  phone_number: string;
  processing_by: string;
  sub_loan_type: string | null;
  notes: string | null;
  employment_type: string;
  dsa_id: number;

}

interface ApplicationState {
  application: Application | null;
  lead: LeadEdit | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: ApplicationState = {
  application: null,//  this application has data of the application with application details and lead details
  lead: null,       //  this lead has data of the lead with lead details for Edit purpose and application list header
  loading: false,
  error: null,
};

// Create the slice
const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    fetchApplicationStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchApplicationSuccess(state, action: PayloadAction<Application>) {
      state.loading = false;
      state.application = action.payload;
       // Extract `leadId` from `application`
    },
    fetchApplicationFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateApplication(state, action: PayloadAction<Application>) {
      state.application = action.payload;
       // Update `leadId` if the application is updated
    },
    updateLead(state, action: PayloadAction<LeadEdit>) {
      state.lead = action.payload;
    },
    resetLead(state) {
      state.lead = null;
    }
  },
});


// Export the actions
export const {
  fetchApplicationStart,
  fetchApplicationSuccess,
  fetchApplicationFailure,
  updateApplication,
  updateLead,
  resetLead,
} = applicationSlice.actions;

// Export the reducer
export default applicationSlice.reducer;
