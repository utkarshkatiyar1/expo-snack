import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_API } from '@/constants/api.constant';
import { get } from '@/services/masterService';

export const getProfile = (toaster: any) => { 
  const url = APP_API.validate;
  return get(url).then((response) => response?.data?.data?.dsa);
};

// export async function getProfile(toaster:any) {
//     try {
//       const token = await AsyncStorage.getItem("auth_token");
//       if (!token) throw new Error("No auth token found");
  
//       const response = await axios.get(
//         "https://api-staging.loannetwork.app/api/v0/validate",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
  
//       // Assuming the profile data is under the 'dsa' key
//       const profileData = response.data?.data?.dsa;
//       console.log("Profile Data:", profileData); // Log to verify the correct data
  
//       return profileData;
//     } catch (error: any) {
//       console.log("Error fetching profile data:", error?.response?.data || error.message);
//       toaster.show("An error occurred while fetching profile data", "error"); // Show error toast
//     }
// }
