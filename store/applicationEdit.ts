import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Disbursement {
  display_disbursement_date: string | null;
  absolute_revenue_commission: number | null;
  rejected_reason: string | null;
  category: string | null;
  display_commission_amount: string | null;
  display_category: string | null;
  display_disbursement_amount: string | null;
  disbursement_amount: number | null;
  notes: string | null;
  status: string | null;
  pdd_cleared: boolean | null;
  display_acknowledgement_status: string | null;
  acknowledgement_status: string | null;
  commission_amount: number | null;
  id: number | null;
  otc_cleared: boolean | null;
  documents: any[] | null;
  commission_on: string | null;
  branch_code: string | null;
  disbursement_type: string | null;
  billing_company: string | null;
  lead: string | null;
  additional_payout: string | null;
  absolute_revenue_commission_unit: string | null;
  loan_account_number: string | null;
  custom_rejected_reason: string | null;
  has_additional_payout: boolean | null;
  display_disbursement_type: string | null;
  additional_payout_percent: number | null;
  display_status: string | null;
  updated_at: string | null;
  disbursement_date: string | null;
  disputed_reason: string | null;
}

interface LendingPartner {
  active: boolean | null;
  commission_on: string | null;
  email_domains: string[] | null;
  id: number | null;
  logo: string | null;
  name: string | null;
  order: number | null;
  slug: string | null;
  type: string | null;
}

interface Document {
  created_at: string | null;
  display_name: string | null;
  id: number | null;
  type: string | null;
  uploaded_by_type: string | null;
  url: string | null;
}

interface ExternalDSA {
  id: number | null;
  name: string | null;
}

interface ApplicationEditState {
  disbursements: Disbursement[] | null;
  sanctioned_amount: number | null;
  rejected_reason: string | null;
  amount: number | null;
  display_commission_amount: string | null;
  is_from_external_dsa: boolean | null;
  lending_partner: LendingPartner | null;
  status: string | null;
  display_sanctioned_date: string | null;
  commission_amount: number | null;
  sanctioned_date: string | null;
  id: number | null;
  bank_rm_phone_number: string | null;
  external_dsa: ExternalDSA | null;
  branch_name: string | null;
  bank_rm_name: string | null;
  display_loan_insurance_amount: string | null;
  is_external_dsa_edit_allowed: boolean | null;
  documents: Document[] | null;
  add_disbursement: boolean | null;
  loan_insurance_amount: number | null;
  logged_in_date: string | null;
  is_application_deletable: boolean | null;
  email_domains: string[] | null;
  loan_insurance_added: boolean | null;
  los_id: string | null;
  display_amount: string | null;
  display_sanctioned_amount: string | null;
  external_dsa_bank_code: string | null;
  custom_rejected_reason: string | null;
  lead_id: number | null;
  display_status: string | null;
  bank_rm_email_address: string | null;
  updated_at: string | null;
  bank_application_id: string | null;
}


// application has the data of the application for edit purpose only it does not have the lead data, update[]
const initialState: ApplicationEditState = {
  disbursements: null,
  sanctioned_amount: null,
  rejected_reason: null,
  amount: null,
  display_commission_amount: null,
  is_from_external_dsa: null,
  lending_partner: null,
  status: null,
  display_sanctioned_date: null,
  commission_amount: null,
  sanctioned_date: null,
  id: null,
  bank_rm_phone_number: null,
  external_dsa: null,
  branch_name: null,
  bank_rm_name: null,
  display_loan_insurance_amount: null,
  is_external_dsa_edit_allowed: null,
  documents: null,
  add_disbursement: null,
  loan_insurance_amount: null,
  logged_in_date: null,
  is_application_deletable: null,
  email_domains: null,
  loan_insurance_added: null,
  los_id: null,
  display_amount: null,
  display_sanctioned_amount: null,
  external_dsa_bank_code: null,
  custom_rejected_reason: null,
  lead_id: null,
  display_status: null,
  bank_rm_email_address: null,
  updated_at: null,
  bank_application_id: null
};

const applicationEditSlice = createSlice({
  name: 'applicationEdit',
  initialState,
  reducers: {
    updateApplicationEdit(state, action: PayloadAction<Partial<ApplicationEditState>>) {
      return {
        ...state,
        ...action.payload
      };
    },
    resetApplicationEdit(state) {
      return initialState;
    }
  }
});

export const { updateApplicationEdit, resetApplicationEdit } = applicationEditSlice.actions;
export default applicationEditSlice.reducer;
