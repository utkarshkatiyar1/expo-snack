// _layout.tsx
import { Stack, useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

export default function Layout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Default is hidden; customize for each screen below if needed
      }}
    >

      <Stack.Screen
  name="commissionstructure" // This corresponds to app/bankcodes.tsx
  options={{
    title: "Commission Structure",
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
      <Stack.Screen
        name="Billingcompany" // Path corresponds to app/profiledata/Billingcompany.tsx
        options={{ title: "Billing Company", headerShown: true }}
      />
      <Stack.Screen
        name="Billingcompanynext" // Path corresponds to app/profiledata/Billingcompany.tsx
        options={{ title: "Details", headerShown: true }}
      />
    </Stack>
  );
}
