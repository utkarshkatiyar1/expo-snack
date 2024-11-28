import _axios, { AxiosRequestConfig, isAxiosError } from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native'; // For Android toast messages
import { useRouter } from "expo-router";

export default async function axios<T>(config: AxiosRequestConfig) {
  const router =useRouter(); // Initialize navigation

  try {
    const token = await AsyncStorage.getItem('auth_token');
    console.log("bearerTken",token) // Get token from AsyncStorage
    const result = await _axios<T>({
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`, // Use the token in your headers
      },
    });
    return result;
  } catch (error: any) {
    if (isAxiosError(error) && error.response?.status === 401) {
      router.replace("/login") // Navigate to login screen
      await AsyncStorage.setItem('auth_token', ''); // Clear token
    } else {
      ToastAndroid.show(
        JSON.stringify(error?.response?.data) || "Failed",
        ToastAndroid.SHORT
      ); // Show error message
    }
    throw error;
  }
}
