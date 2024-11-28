import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationsParams } from "@/utils/type";

// Base API URL for notifications
const API_URL = "https://api-staging.loannetwork.app/api/notification";

// Fetch notifications function
export const fetchNotifications = async (
  page: number = 1, // Default to page 1 if not provided
  size: number = 50 // Default to size 50 if not provided
): Promise<NotificationsParams[]> => {
  try {
    // Retrieve the auth token from AsyncStorage
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No auth token found");
    }

    // Make the API request
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      },
    });

    // Extract notifications from the response
    const notifications = response.data?.data?.notifications;
    if (notifications) {
      // Optionally save notifications to AsyncStorage
      await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
      console.log("Notifications fetched successfully:", notifications);
      return notifications;
    } else {
      console.error("No notifications found in the response");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
};
