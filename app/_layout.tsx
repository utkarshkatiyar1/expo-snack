import { Stack, useRouter } from "expo-router";
import { Provider, useDispatch } from "react-redux";
import store from "../store"; // Adjust the path if necessary
// import Toast from "react-native-toast-message";
import { ToastProvider } from "react-native-toast-notifications";
import { useEffect } from "react";
import { getProfile } from "@/api/profile";
import Entypo from "@expo/vector-icons/Entypo";
export default function Layout() {

  const router = useRouter();

  return (
    <Provider store={store}>
      <ToastProvider
        offsetBottom={100}
        duration={2000}
        placement="bottom"
        animationType="slide-in"
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="bankcodes" // This corresponds to app/bankcodes.tsx
            options={{ title: "Bank Codes", headerShown: true }}
          />
                <Stack.Screen
  name="profile" // This corresponds to app/bankcodes.tsx
  options={{
    title: "Profile",
    headerShown: true,
    headerTitleStyle: {
      fontSize: 20, // Adjust the font size
      fontWeight: 'light', // Make the text bold
      color: 'grey', // Change the text color // Center the text (might not work in all cases)
    },
    headerLeft: () => (
      <Entypo
        name="chevron-left"
        size={24}
        color="black"
        style={{ marginRight: 5 }} // Optional styling for spacing
        onPress={() => {
          // You can add custom navigation logic here if needed
          router.back(); // Ensure 'navigation' is available in your scope
        }}
      />
    ),
  }}
/>
        </Stack>
      </ToastProvider>
      {/* <Toast/> */}
    </Provider>
  );
}
