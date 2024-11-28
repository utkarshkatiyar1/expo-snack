// api.ts (Updated to include billing companies)
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type for each billing company item
export interface BillingCompanyItem {
  id: number;
  name: string;
  address: string;
  display_status: string;
  gstin: string | null;
  pan: string;
}

// Function to fetch billing company data
export const fetchBillingCompanyData = async (
  page: number,
  size: number
) => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token");

    if (!token) {
      throw new Error("No auth token found");
    }

    // Make the API request using axios
    const response = await axios.get(
      `https://api-staging.loannetwork.app/api/billing_companies?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in headers
        },
      }
    );

    // Check if data exists in the response
    if (response.data?.data) {
      return response.data; // Return the data array
    } else {
      console.error("Billing companies not found in response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching billing company data:", error);
    return null;
  }
};

