// api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type for each commission item
export interface CommissionItem {
  absolute_revenue_commission_processed_by_ln: number;
  absolute_revenue_commission_processed_by_self: number;
  loan_type: {
    display_name: string;
  };
  updated_at: string;
}

// Function to fetch commission data
export const fetchCommissionData = async (): Promise<CommissionItem[] | null> => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token");

    if (!token) {
      throw new Error("No auth token found");
    }

    // Make the API request using axios
    const response = await axios.get(
      "https://api-staging.loannetwork.app/api/commission_structure/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log("API Response:", response.data);

    if (response.data?.data?.commission_structure) {
      const flatData = response.data.data.commission_structure.flatMap(
        (item: any) => item
      );
      return flatData;
    } else {
      console.error("Commission structure not found in response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
