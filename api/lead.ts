import { LeadApplicationParams, LeadParams } from "@/utils/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useToast } from "react-native-toast-notifications"; // Import useToast

const apiKey = process.env['NEXT_PUBLIC_API_SERVICE']
console.log("apiKey",apiKey);



interface Document {
  localDoc: boolean;
  type: string;
  url: string;
}

 export interface LoanDetailsParams {
  bank_rm_email_address: string;
  bank_rm_name: string;
  bank_rm_phone_number: string;
  documents: Document[];
  loan_insurance_added: boolean;
  loan_insurance_amount: number;
  sanctioned_amount: number;
  sanctioned_date: string; // Consider using Date type if you're parsing this as a Date object
  status: string;
}


export interface DisbursementDetailsParams {
  commission_on: string;
  disbursement_amount: number;
  disbursement_date: string; // Use Date if you plan to parse this as a Date object
  disbursement_type: string;
  documents: Document[];
  loan_account_number: string;
  otc_cleared: boolean;
  pdd_cleared: boolean;
}

export interface DisbursementUpdateParams {
  commission_on: string;
  disbursement_amount: number;
  disbursement_date: string; // Use Date if you plan to parse this as a Date object
  disbursement_type: string;
  documents: Document[];
  loan_account_number: string;
  otc_cleared: boolean;
  pdd_cleared: boolean;
  category: string;
  branch_code: string;
  has_additional_payout: boolean;
}



export async function createLead(leadParams: LeadParams, toaster:any) {
  const token = await AsyncStorage.getItem("auth_token");
  console.log("leadParams", leadParams);
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/lead_management/lead`,
      {
        dsa_id: leadParams.dsa_id,
        employment_type: leadParams.employment_type,
        loan_amount: leadParams.loan_amount,
        loan_type_id: leadParams.loan_type_id,
        name: leadParams.name,
        notes: leadParams.notes,
        pan: leadParams.pan,
        phone_number: leadParams.phone_number,
        processing_by: leadParams.processing_by,
        sub_loan_type: leadParams.sub_loan_type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
          "Content-Type": "application/json", // Optional, but usually set for JSON payloads
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    toaster.show("An error has occurred");
  }
}

export async function editLead(id:string,leadParams: LeadParams, toaster:any) {
  const token = await AsyncStorage.getItem("auth_token");
  console.log("leadParams", leadParams);
  try {
    const response = await axios.patch(
      `https://api-staging.loannetwork.app/api/lead_management/lead/${id}`,
      {
        dsa_id: leadParams.dsa_id,
        employment_type: leadParams.employment_type,
        loan_amount: leadParams.loan_amount,
        loan_type_id: leadParams.loan_type_id,
        name: leadParams.name,
        notes: leadParams.notes,
        pan: leadParams.pan,
        phone_number: leadParams.phone_number,
        processing_by: leadParams.processing_by,
        sub_loan_type: leadParams.sub_loan_type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
          "Content-Type": "application/json", // Optional, but usually set for JSON payloads
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    toaster.show("An error has occurred");
  }
}

export async function deleteLead(id:string, toaster:any) {
  const token = await AsyncStorage.getItem("auth_token");
 
  try {
    const response = await axios.delete(
      `https://api-staging.loannetwork.app/api/lead_management/lead/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
          "Content-Type": "application/json", // Optional, but usually set for JSON payloads
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    toaster.show("An error has occurred");
  }
}
 
export async function createLeadApplication(
 id:string,  applicationParams: LeadApplicationParams, toaster:any
) {
  const token = await AsyncStorage.getItem("auth_token");
  console.log("leadAppParams", applicationParams);
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/lead_management/lead/${id}/application`,
      {
        bank_application_id: applicationParams.bank_application_id,
        branch_name: applicationParams.branch_name,
        lending_partner_id: applicationParams.lending_partner_id,
        is_from_external_dsa: applicationParams.is_from_external_dsa,
        status: applicationParams.status,
        external_dsa_id: applicationParams.external_dsa_id,
        
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
          "Content-Type": "application/json", // Optional, but usually set for JSON payloads
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    toaster.show("An error has occurred");
  }
}

export async function editApplication(
  id:string,  applicationParams: LeadApplicationParams, toaster:any
 ) {
   const token = await AsyncStorage.getItem("auth_token");
   console.log("leadAppParams", applicationParams);
   try {
     const response = await axios.patch(
       `https://api-staging.loannetwork.app/api/lead_management/application/${id}`,
       {
         bank_application_id: applicationParams.bank_application_id,
         branch_name: applicationParams.branch_name,
         lending_partner_id: applicationParams.lending_partner_id,
         is_from_external_dsa: applicationParams.is_from_external_dsa,
         status: applicationParams.status,
         external_dsa_id: applicationParams.external_dsa_id,
       
       },
       {
         headers: {
           Authorization: `Bearer ${token}`, // Pass the authorization token here
           "Content-Type": "application/json", // Optional, but usually set for JSON payloads
         },
       }
     );
 
     return response.data;
   } catch (error) {
     console.log("error", error);
     toaster.show("An error has occurred");
   }
 }

 export async function deleteApplication(id:string, toaster:any) {
  const token = await AsyncStorage.getItem("auth_token");
 
  try {
    const response = await axios.delete(
      `https://api-staging.loannetwork.app/api/lead_management/application/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
          "Content-Type": "application/json", // Optional, but usually set for JSON payloads
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
    toaster.show("An error has occurred");
  }
}

export async function leadsList(query = '', page = 1, toaster:any) {
  const token = await AsyncStorage.getItem("auth_token");

  try {
    const searchQuery = query.trim(); 
    const baseUrl = "https://api-staging.loannetwork.app/api/v1/lead_management/leads";
    const url =
      searchQuery.length <= 3
        ? `${baseUrl}?page=${page}&size=10`
        : `${baseUrl}?page=${page}&size=10&q=${searchQuery}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Error:", error);
    toaster.show("An error has occurred");

  }
}

  export async function leadApplications(id:string, toaster:any ) {
    const token = await AsyncStorage.getItem("auth_token");

    console.log("id",id);
    try {
        const response = await axios.get(
            `https://api-staging.loannetwork.app/api/lead_management/lead/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
      toaster.show("An error has occurred");
    }
  }

  export async function applicationDetails( id:string ,toaster:any ) {
    const token = await AsyncStorage.getItem("auth_token");
    try {
        const response = await axios.get(
            `https://api-staging.loannetwork.app/api/lead_management/application/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
      toaster.show("An error has occurred");
    }
  }

  export async function updateSanctioned( id:string ,leadDetails:LoanDetailsParams, toaster:any ) {
    const token = await AsyncStorage.getItem("auth_token");
    try {
        const response = await axios.patch(
            `https://api-staging.loannetwork.app/api/lead_management/application/${id}`,
            {
                bank_rm_email_address: leadDetails.bank_rm_email_address,
                bank_rm_name: leadDetails.bank_rm_name,
                bank_rm_phone_number: leadDetails.bank_rm_phone_number,
                documents: leadDetails.documents,
                loan_insurance_added: leadDetails.loan_insurance_added,
                loan_insurance_amount: leadDetails.loan_insurance_amount,
                sanctioned_amount: leadDetails.sanctioned_amount,
                sanctioned_date: leadDetails.sanctioned_date,
                status: leadDetails.status,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
      toaster.show("An error has occurred");
    }
  }

  export async function updateToDisbursed(
    id:string, disbursement: DisbursementDetailsParams, toaster:any
  ) {
    const token = await AsyncStorage.getItem("auth_token");
    console.log("disbursement", disbursement);
    try {
      const response = await axios.post(
        `https://api-staging.loannetwork.app/api/lead_management/application/${id}/disbursement`,
        {
          commission_on: disbursement.commission_on,
          disbursement_amount: disbursement.disbursement_amount,
          disbursement_date: disbursement.disbursement_date,
          disbursement_type: disbursement.disbursement_type,
          documents: disbursement.documents,
          loan_account_number: disbursement.loan_account_number,
          otc_cleared: disbursement.otc_cleared,
          pdd_cleared: disbursement.pdd_cleared,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the authorization token here
            "Content-Type": "application/json", // Optional, but usually set for JSON payloads
          },
        },
      );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
      toaster.show("An error has occurred");
    }
  }


  export async function financial_Institution( toaster:any ) {
    const token = await AsyncStorage.getItem("auth_token");
    try {
        const response = await axios.get(
            "https://api-staging.loannetwork.app/api/financial_institute/lending_partners?page=1&size=10",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
      toaster.show("An error has occurred");
    }
  }


  export async function editDisbusrement(id:string,disbursementParams: DisbursementUpdateParams) {
    const token = await AsyncStorage.getItem("auth_token");
    console.log("disbursementParams", disbursementParams);
    try {
      const response = await axios.patch(
        `https://api-staging.loannetwork.app/api/lead_management/disbursement/${id}`,
        {
          branch_code: disbursementParams.branch_code,
          category: disbursementParams.category,
          commission_on: "disbursal_amount",
          disbursement_amount: disbursementParams.disbursement_amount,
          disbursement_date: disbursementParams.disbursement_date,
          disbursement_type: disbursementParams.disbursement_type,
          documents:  disbursementParams.documents,
          has_additional_payout: disbursementParams.has_additional_payout,
          loan_account_number: disbursementParams.loan_account_number,
          otc_cleared: disbursementParams.otc_cleared,
          pdd_cleared: disbursementParams.pdd_cleared,      },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the authorization token here
            "Content-Type": "application/json", // Optional, but usually set for JSON payloads
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }


  


