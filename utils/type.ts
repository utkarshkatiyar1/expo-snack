// types.ts
export interface FormData {
    city_id: number,
    email: string,
    name: string,
    org_address: string,
    org_name: string
  }
  
  export interface BankAccount {
    account_number: string;
    account_type: string;
    bank_id: string;
    cancelled_cheque: string;
    ifsc: string;
    name: string;
  }
  
  export interface BillingCompanyParams {
    address: string;
    bill_to_city_id: number;
    bill_to_pincode: string;
    company_type: string;
    email: string;
    gst_doc: string;
    gstin: string;
    name: string;
    pan: string;
    pan_doc: string;
    place_of_supply_id: string;
    signature: string;
    bank_account: BankAccount;
  }



  export interface BillingCompanyItem {
    name: string;
    address: string;
    place_of_supply: string;
    company_type: string;
    email: string;
    gstin: string;
    pan: string;
    display_status: string;
    bank_account: {
      name: string;
      ifsc: string;
      bank_id: string;
      account_type: string;
      account_number: string;
    };
  }

  export interface LeadParams {
    dsa_id: number;
    employment_type: string;
    loan_amount: number;
    loan_type_id: number;
    name: string;
    notes: string;
    pan:string
    phone_number: string;
    processing_by: string;
    sub_loan_type: string|null;
  }

  export interface LeadApplicationParams {
    bank_application_id: string;
    branch_name: string;
    lending_partner_id:number;
    is_from_external_dsa:boolean;
    status: string;
    external_dsa_id: number|null;
  }

  export interface Client {
    mobile_number: string;
    name: string;
  }
  
  export interface ContactDetails {
    client: Client;
    colour: string;
    dsa: any | null;
    employee: any | null;
    processing_by_title: string;
  }
  
  export interface LoanType {
    display_name: string;
    id: number;
    name: string;
  }
  
  export interface LendingPartner {
    active: boolean;
    commission_on: string;
    email_domains: string[];
    id: number;
    logo: string;
    name: string;
    order: number;
    slug: string;
    type: string;
  }
  
  export interface Application {
    disbursements: any[]; // Assuming it's an array; you can replace 'any' with the correct type if needed.
    add_disbursement: boolean;
    external_dsa: any | null;
    status: string;
    documents: any[]; // Assuming it's an array; replace 'any' if you know the specific type.
    is_from_external_dsa: boolean;
    is_application_deletable: boolean;
    logged_in_date: string;
    display_amount: string;
    id: number;
    external_dsa_bank_code: string | null;
    bank_rm_phone_number: string | null;
    updated_at: string;
    sanctioned_amount: number | null;
    bank_rm_name: string | null;
    lead_id: number;
    is_external_dsa_edit_allowed: boolean;
    los_id: string | null;
    email_domains: string[];
    rejected_reason: string | null;
    branch_name: string;
    bank_rm_email_address: string | null;
    loan_insurance_added: boolean | null;
    display_sanctioned_amount: string | null;
    sanctioned_date: string | null;
    amount: number;
    display_sanctioned_date: string | null;
    display_loan_insurance_amount: string | null;
    display_commission_amount: string;
    bank_application_id: string;
    lending_partner: LendingPartner;
    custom_rejected_reason: string;
    loan_insurance_amount: number | null;
    display_status: string;
    commission_amount: number;
  }
  
  export interface Lead {
    action_on_lead_allowed: boolean;
    applications: Application[];
    category: any | null;
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
    loan_type: LoanType;
    name: string;
    notes: any | null;
    pan: string;
    phone_number: string;
    processing_by: string;
    status: string;
    sub_loan_type: any | null;
  }
  
  export interface LeadObject {
    application_count: number;
    badge_count: number;
    contact_details: ContactDetails;
    lead: Lead;
  }

  export interface PayableAmount {
    payable_amount: number;
    tds_percent: number;
    gst: number;
    name: string;
    gstin: string;
    pan: string;
  }
  
  export interface Distribution {
    commission_amount: number;
    commission_date: string;
    commission_structure: string;
    disbursement_amount: number;
    disbursement_date: string;
    lan: string;
    name: string;
  }
  
  export interface InvoiceDetails {
    invoice_date: string;
    base_amount: number;
    payable_amounts: PayableAmount[];
    distributions: Distribution[];
    updated_at: string;
    display_status: string;
  }
  

  export interface PayoutData {
    dsa_joined_days: string;
    total_payout: string;
  }

  export interface NotificationPayload {
    application_id: number;
    disbursement_id: number;
    lead_id: number;
  }
  
  export interface NotificationsParams {
    action: string;
    body: string;
    colour: string;
    display_date: string;
    dsa_id: number;
    entity_id: number;
    entity_type: string;
    id: number;
    payload: NotificationPayload;
    read: boolean;
    read_at: string | null;
    title: string;
    type: string;
  }