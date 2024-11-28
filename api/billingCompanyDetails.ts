import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BillingCompanyItem } from "../utils/type";

interface BankAccount {
  account_number: string;
  bank_id: number;
  billing_company_id: number;
  cancelled_cheque: string;
  ifsc: string;
  is_bank_verified: boolean;
}

interface ServiceAgreement {
  accepted: boolean;
  url: string;
}

export interface BillingCompanyDetails {
  address: string;
  bank_account: BankAccount;
  bill_to_city_id: number;
  bill_to_pincode: string;
  change_notes: string | null;
  change_notes_string: string | null;
  company_type: string;
  display_status: string;
  dsa_id: number;
  email: string;
  gst_doc: string;
  gstin: string;
  name: string;
  organization_id: number;
  pan: string;
  pan_doc: string;
  place_of_supply: string;
  service_agreement: ServiceAgreement;
  signature: string;
  status: string;
}


export const fetchBillingCompanyDetails = async (id: number): Promise<BillingCompanyDetails | null> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.get(
      `https://api-staging.loannetwork.app/api/billing_companies/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data || null;
    
  } catch (error) {
    console.error("Error fetching billing company details:", error);
    return null;
  }
};
