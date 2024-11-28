// bankCodesService.ts

import axios from "axios";

// Define the types for the bank data
export interface BankCode {
  bankname: string;
  branch: string;
  code: string;
  product: string | null;
  id: string;
}

// Function to fetch commission structure data
export const fetchCommissionStructure = async (): Promise<BankCode[]> => {
  try {
    const response = await axios.get(
      "https://api-staging.loannetwork.app/api/commission_structure"
    );

    const branchStructures =
      response?.data?.data?.branch_commission_structures;

    if (!branchStructures || !Array.isArray(branchStructures)) {
      throw new Error("Invalid response structure");
    }

    // Map response to our `BankCode` type
    const extractedData: BankCode[] = branchStructures.map((item: any) => ({
      bankname: item.bank_name,
      branch: item.branch_name,
      code: item.branch_code,
      product: item.product_display_name,
      id: item.branch_code + (item.product || ""),
    }));

    return extractedData;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch data");
  }
};
