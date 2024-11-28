import { Entypo } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

export default function Layout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="userForm" // This corresponds to app/index.tsx
        options={{
          title: "Baisc Details",
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="secondForm" // This corresponds to app/modal.tsx
        options={{ title: "Create Billing Company", headerShown: true }}
      />
      <Stack.Screen
        name="thirdForm" // This corresponds to app/modal.tsx
        options={{ title: "Create Billing Company", headerShown: true }}
      />
      <Stack.Screen
        name="preview" // This corresponds to app/modal.tsx
        options={{ title: "Preview page", headerShown: true }}
      />
      <Stack.Screen
        name="ImageViewer" // This corresponds to app/modal.tsx
        options={{ title: "", headerShown: true,headerLeft: () => (
          <Entypo
            name="chevron-left"
            size={24}
            color="black"
            style={{ marginRight: 5 }} // Optional styling for spacing
            onPress={() => {
              // You can add custom navigation logic here if needed
              router.back(); // Ensure 'navigation' is available in your scope
            }}
          /> )}}
      />
    </Stack>
  );
}
