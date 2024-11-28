import Entypo from "@expo/vector-icons/Entypo";
import { Stack, useRouter } from "expo-router";

export default function Layout() {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="AddDisbursements" // This corresponds to app/bankcodes.tsx
        options={{
          title: "Add Disbursement",
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
                router.back(); // Ensure 'navigation' is available in your scope
              }}
            />
          ),
        }}
      />

<Stack.Screen
        name="details" // This corresponds to app/bankcodes.tsx
        options={{
          title: "Disbursement Details",
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
                router.back(); // Ensure 'navigation' is available in your scope
              }}
            />
          ),
        }}
      />

<Stack.Screen
        name="update-details" // This corresponds to app/bankcodes.tsx
        options={{
          title: "Update Disbursement Details",
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
                router.back(); // Ensure 'navigation' is available in your scope
              }}
            />
          ),
        }}
      />
    </Stack>
  );
}