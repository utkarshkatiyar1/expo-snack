// invoiceAPI.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchInvoiceDetails = async (invoiceId: string) => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get(
      `https://api-staging.loannetwork.app/api/invoice/${invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    throw error;
  }
};
