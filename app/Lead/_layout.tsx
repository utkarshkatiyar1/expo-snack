
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Lead() {
  const router = useRouter();
 
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index" // This corresponds to app/bankcodes.tsx
        options={{ title: "Create New Lead", headerShown: false,
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
        name="application" // This corresponds to app/bankcodes.tsx
        options={{ title: "Create New Application", headerShown: false ,
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
     name="applicationList"
  // options={({ route }: { route: { params?: { title?: string } } }) => ({
  //   title: route.params?.title || 'Default Title', // Use dynamic title if available
  //   headerShown: true,
  // })}
  options={{ title: "Application List", headerShown: false ,
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
     name="MyDsa"
  // options={({ route }: { route: { params?: { title?: string } } }) => ({
  //   title: route.params?.title || 'Default Title', // Use dynamic title if available
  //   headerShown: true,
  // })}
  options={{ title: "My Dsa", headerShown: true ,
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
     name="TabNavigator"
     options={{ title: "Credit Check", headerShown: true ,
      headerTitleStyle: {
      fontSize: 20,
      fontWeight: 'light',
      color: 'grey',
    },
    headerLeft: () => (
      <Entypo
        name="chevron-left"
        size={24}
        color="black"
        style={{ marginRight: 5 }}
        onPress={() => {
          router.back(); 
        }}
      />
    ),

    headerRight: () => (
        <AntDesign name="questioncircleo" size={24} color="black" />
    ),  
  }}
 
  
/>

{/* <Stack.Screen
        name="applicationDetails" // This corresponds to app/bankcodes.tsx
        options={{ title: "Create New Application", headerShown: true }}
      /> */}
    </Stack>
  );
}
