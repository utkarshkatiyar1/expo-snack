// api.ts

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayoutData } from "@/utils/type"; // Make sure to adjust the import path

export const fetchPayoutData = async (): Promise<PayoutData | null> => {
  try {
    // Retrieve the auth token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No auth token found");
    }

    // Make the authorized API request
    const response = await axios.get<{ data: PayoutData }>(
      "https://api-staging.loannetwork.app/api/payouts/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching payout data:", error);
    return null;
  }
};
