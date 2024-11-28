import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications"; // Import useToast

export interface VerifyOtpParams {
  mobileNumber: string;
  otp: string;
}

export async function getOtp(mobileNumber: string, toaster: any) { // Pass toaster as argument
  
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/v0/otp/send`,
      {
        mobile_number: mobileNumber,
      }
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    toaster.show("An error has occurred while sending OTP.", { type: "error" }); 
    console.log("error", error);
  }
}

export async function verifyotp({ mobileNumber, otp }: VerifyOtpParams, toaster: any) { 
  try {
    const response = await axios.post(
      `https://api-staging.loannetwork.app/api/v0/otp/verify`,
      {
        mobile_number: mobileNumber,
        code: otp,
      }
    );
    console.log("responsetoken", response?.data?.data.token);
    const token = response?.data?.data.token;
    await AsyncStorage.setItem("auth_token", token);
    return response.data;
  } catch (error) {
    toaster.show("An error has occurred while verifying OTP.", { type: "error" }); 
    console.log("error", error);
  }
}
