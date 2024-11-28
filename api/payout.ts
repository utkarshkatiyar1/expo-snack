import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the Payout and Invoice types
export interface Invoice {
  billing_company_name: string;
  id: number;
  invoice_number: string | null;
}

export interface Payout {
  id: number;
  display_amount_credited: string;
  display_component_type: string;
  invoice: Invoice;
  payment_date: string | null;
  payment_reference_id: string | null;
}

// Function to fetch payouts from the API
export const fetchPayouts = async (): Promise<Payout[] | null> => {
  try {
    // Retrieve the auth token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token");
    console.log("Retrieved Token:", token);

    if (!token) {
      throw new Error("No auth token found");
    }

    // Make the API request with the Authorization header
    const response = await axios.get(
      "https://api-staging.loannetwork.app/api/payouts?page=1&size=10",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API Response:", response.data);

    if (response.data?.data?.payouts) {
      return response.data.data.payouts;
    } else {
      console.error("Payouts not found in response:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return null;
  }
};
