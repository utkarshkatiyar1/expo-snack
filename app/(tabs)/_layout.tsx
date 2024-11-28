import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import ModalWithOptions from "../Lead/ModalWithOptions";
import { getProfile } from "@/api/profile";
import { setRole } from "@/store/profile";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FontAwesome6 } from "@expo/vector-icons";
import { resetLead } from "@/store/applicationSlice";
import { resetApplicationEdit } from "@/store/applicationEdit";
import { useToast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const toaster = useToast(); // Get toaster instance
  const router = useRouter();
  const dispatch = useDispatch();
 
  const employeeRole = useSelector((state: RootState) => state.util.role);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleLeadClick = () => {
    dispatch(resetLead());
    dispatch(resetApplicationEdit());
    console.log("employeeRole", employeeRole);
    if (employeeRole === "internal_employee") {
      handleOpenModal();

    }
    else{
      router.push({
        pathname:"/Lead",
        params: { purpose:"create" }
      });
    }
  };
 
  useEffect(() => { 
    getProfile(toaster).then(async (response) => {
      if (response) {
        console.log("responseProfile", response,"id", response.id);
        if(response.linked_employee!==null){
          dispatch(setRole("internal_employee"))

        }
        else{
          dispatch(setRole("external_employee"))
        }
      }
      const token =  await AsyncStorage.getItem("auth_token");
      setToken(token);
    });

  
  } , [])
  const handleSubmit = (selectedOption : string|null) => {
    console.log('Selected option:', selectedOption);

    if(selectedOption === "In House"){
      router.push({
        pathname:"/Lead",
        params: { purpose:"create" }
      });
    }
    else{
      router.push("../Lead/MyDsa");
    }
    handleCloseModal();
    // Handle the submitted option as needed
  };
  if (!token) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    );
  }
  return (
    <>
      <Tabs
        screenOptions={{ tabBarActiveTintColor: "#007BFF", headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              // <FontAwesome size={28} name="home" color={color} />
              <MaterialCommunityIcons
                name="home-outline"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="leads"
          options={({ navigation }) => ({
            title: "Leads",
            headerShown: true,
            tabBarIcon: ({ color }) => (
              <SimpleLineIcons name="people" size={24} color={color} />
            ),
            headerRight: () => (
              <>
                <Text
                  style={{
                    marginRight: 10,
                    fontSize: 16,
                    color: "#007BFF",
                  }}
                  onPress={handleLeadClick}
                >
                  + Create Lead
                </Text>
              </>
            ),
          })}
        />
        
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            // <FontAwesome5 name="file-invoice" size={24} color={color} />
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
          headerRight: ({}) => (
           
              <TouchableOpacity style={{flex:1,flexDirection:"row",justifyContent:"center",alignItems:"center"}} onPress={() => router.push("/profiledata/Billingcompany")}>
              <FontAwesome6 name="shop" size={14} color= "#007BFF"/>
              
              <Text
                style={{
                  marginRight: 10,
                  marginLeft: 5,
                  fontSize: 14,
                  color: "#007BFF",
                }}
              >
                Billing Companies
              </Text>
              </TouchableOpacity>
            
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={({ navigation }) => ({
          title: "Notifications",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <SimpleLineIcons name= "bell" size={24} color={color} />
          ),
          headerRight: () => (
            <>
              <Text
                style={{
                  marginRight: 10,
                  fontSize: 16,
                  color: "#1963ED",
                }}
              >
                Mark all as Read
              </Text>
            </>
          ),
        })}
      />
    </Tabs>
    <ModalWithOptions
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
