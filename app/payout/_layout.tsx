import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="page" // This corresponds to app/bankcodes.tsx
        options={{ title: "Payout", headerShown: true }}
      />
      <Stack.Screen
        name="invoicedetails" // This corresponds to app/bankcodes.tsx
        options={{ title: "Invoice Details", headerShown: true }}
      />
    </Stack>
  );
}
