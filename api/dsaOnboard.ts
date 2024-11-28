import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications"; // Import the toaster hook
import { View, Text } from "react-native"; // Ensure View and Text are imported for rendering custom content

export interface basicDeatilsParams {
  city_id: number;
  email: string;
  name: string;
  org_address: string;
  org_name: string;
}

// Interface for Bank Account
export interface BankAccount {
  account_number: string;
  account_type: string;
  bank_id: number;
  cancelled_cheque: string; // Assuming this is a URL or base64 string of the cheque image
  ifsc: string;
  name: string;
}

// Interface for Request Body
export interface BillingCompanyParams {
  address: string;
  bill_to_city_id: number;
  bill_to_pincode: string;
  company_type: string;
  email: string;
  gst_doc: string; // Assuming it's a URL or base64 string
  gstin: string;
  name: string;
  pan: string;
  pan_doc: string; // Assuming it's a URL or base64 string
  place_of_supply_id: string;
  signature: string; // URL or base64 string of the signature
  bank_account: BankAccount;
}

export async function basicDeatilas(basic_details: basicDeatilsParams, toaster: any) {
  const token = await AsyncStorage.getItem("auth_token");
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/dsa/new`,
      {
        city_id: basic_details.city_id,
        email: basic_details.email,
        name: basic_details.name,
        org_address: basic_details.org_address,
        org_name: basic_details.org_name,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    toaster.show("An error has occurred", {
      type: "danger", // Toast style: danger for errors
      duration: 5000, // Toast duration
      placement: "bottom", // Toast placement at the bottom
    });
    console.log("error", error);
  }
}

export async function billingCompanies(billing_companies: BillingCompanyParams, toaster: any) {
  const token = await AsyncStorage.getItem("auth_token");
  console.log("token", token, billing_companies);
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/billing_companies`,
      {
        address: billing_companies.address,
        bill_to_city_id: billing_companies.bill_to_city_id,
        bill_to_pincode: billing_companies.bill_to_pincode,
        company_type: billing_companies.company_type,
        email: billing_companies.email,
        gst_doc: billing_companies.gst_doc,
        gstin: billing_companies.gstin,
        name: billing_companies.name,
        pan: billing_companies.pan,
        pan_doc: billing_companies.pan_doc,
        place_of_supply_id: billing_companies.place_of_supply_id,
        signature: billing_companies.signature,
        bank_account: billing_companies.bank_account,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response1", response.data);
    return response.data;
  } catch (error) {
    toaster.show("An error has occurred", {
      type: "danger", // Toast style: danger for errors
      duration: 5000, // Toast duration
      placement: "bottom", // Toast placement at the bottom
    });
    console.log("error", error);
  }
}

export async function getMetadata(toaster: any) {
  const token = await AsyncStorage.getItem("auth_token");
  try {
    const response = await axios.get(
      `https://api-staging.loannetwork.app/api/metadata`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    toaster.show("An error has occurred", {
      type: "danger", // Toast style: danger for errors
      duration: 5000, // Toast duration
      placement: "bottom", // Toast placement at the bottom
    });
    console.log("error", error);
  }
}
