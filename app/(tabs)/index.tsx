// app/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Profile from "@/assets/svg/profile";
import Chat from "@/assets/svg/chat";
import Logo from "@/assets/svg/Loannetworklogo";
import Earningsnew from "@/assets/svg/earningsnew";
import Lead from "@/assets/svg/lead";
import Sbi from "@/assets/svg/sbi";
import Boi from "@/assets/svg/boi";
import BankCodes from "@/assets/svg/bankcodes";
import PayoutDashboard from "../payout/payoutdashboard";
import { useDispatch, useSelector } from "react-redux";
import { setMetadata } from "@/store/metadataSlice";
import { setBillingData, setFormData } from "@/store/formSlice";
import { getMetadata } from "@/api/dsaOnboard";
import { getProfile } from "@/api/profile";
import { setRole } from "@/store/profile";
import { RootState } from "@/store";
import { useToast } from "react-native-toast-notifications";
import { resetLead } from "@/store/applicationSlice";
import { resetApplicationEdit } from "@/store/applicationEdit";
import ModalWithOptions from "../Lead/ModalWithOptions";


interface Metadata {
  announcements: any[];
  bank_account_types: BankAccountType[];
  banks: Bank[];
  city: City[];
  company_types: CompanyType[];
  current_playstore_version: number;
  customer_support_number: string;
  employee_types: EmployeeType[];
  exclusive_offers: string[];
  external_dsa: ExternalDsa[];
  force_update: boolean;
  list_place_of_supply: PlaceOfSupply[];
  loan_types: LoanType[];
  minimum_supported_version: MinimumSupportedVersion;
  privacy_policy_url: string;
  state: State[];
  terms_and_conditions_url: string;
}

interface BankAccountType {
  display_name: string;
  name: string;
}

interface Bank {
  active: boolean;
  id: number;
  name: string;
}

interface City {
  active: boolean;
  id: number;
  name: string;
}

interface CompanyType {
  display_name: string;
  name: string;
}

interface EmployeeType {
  display_role: string;
  role: string;
}

interface ExternalDsa {
  id: number;
  name: string;
}

interface PlaceOfSupply {
  gst_code: string;
  name: string;
}

interface LoanType {
  absolute_revenue_commission_processed_by_ln: number;
  absolute_revenue_commission_processed_by_self: number;
  active: boolean;
  display_name: string;
  id: number;
  name: string;
}

interface MinimumSupportedVersion {
  android: number;
  ios: number;
}

interface State {
  id: number;
  name: string;
}
const HomeScreen: React.FC = () => {
  const router = useRouter();
  const toaster = useToast(); // Get toaster instance

  const dispatch = useDispatch();
  
  const employeeRole = useSelector((state: RootState) => state.util.role);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [isActive, setIsActive] = useState(false);
  const [metaData, setMetaData] = useState<Metadata | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

 
  const createLead = () => {
    dispatch(resetLead());
    dispatch(resetApplicationEdit());
     if(employeeRole === "internal_employee"){
        handleOpenModal();
     }
     else{
        router.push("/Lead");
      }

  };  

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
  const handleLogIn = () => {
    router.push("/login");
  };

  const handlePayout = () => {
    router.push("/payout/page");
  };

  const handleBankCode = () => {
    router.push("/bankcodes");
  };

  const handleProfile = () => {
    router.push("/profile");
  };
  const handleWhatsAppChat = () => {
    let phoneNumber = "917718827472"; // include the country code, without '+' sign
    let url = `whatsapp://send?phone=${phoneNumber}&text=Hello`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("WhatsApp is not installed");
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  const fetchData = async () => {
    const response = await getMetadata(toaster);
    const token = await AsyncStorage.getItem("auth_token");
    setToken(token);
    setMetaData(response.data);
    dispatch(setMetadata(response.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checkAuthStatus = async () => {
    const activeStatus = await AsyncStorage.getItem("auth_token");
    setIsLoggedIn(!!activeStatus); // Update login status based on token presence
  };

  useEffect(() => {
    checkAuthStatus(); // Check login status when the component mounts
  }, []);

  return (
    <ScrollView style={styles.main}>
      <View style={styles.headerContainer}>
        {/* Loan Network Logo */}
        <Logo />

        {/* WhatsApp Chat Icon */}
        <TouchableOpacity>
          <Chat onPress={handleWhatsAppChat} marginLeft={120}></Chat>
        </TouchableOpacity>

        {/* Conditionally render Profile or Login */}
        <Pressable
          onPress={async () => {
            const activeStatus = await AsyncStorage.getItem("auth_token");
            activeStatus ? handleProfile() : handleLogIn();
          }}
        >
          {isLoggedIn ? (
            <Profile title="Profile" marginRight={5}></Profile>
          ) : (
            <Profile title="Login" marginRight={5}></Profile>
          )}
        </Pressable>
      </View>

      <View style={styles.container}>
        {/* Total Earnings Section */}

        <Pressable style={styles.earningsContainer} onPress={handlePayout}>
          {isLoggedIn ? <PayoutDashboard /> : <Earningsnew />}
        </Pressable>

        {/* Bank Codes Section */}
        <Pressable style={styles.bankcodescontainer} onPress={handleBankCode}>
          <BankCodes title="Bank Codes" />
        </Pressable>

        {/* Create Lead Section */}
        <View style={styles.backgroundImage}>
          <Lead />
          <TouchableOpacity
            style={styles.createLeadButton}
            onPress={!token? handleLogIn:createLead}
          >
            <Text style={styles.buttonText}>CREATE LEAD</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
            style={styles.createLeadButton}
            onPress={()=>router.push("../Lead/TabNavigator")}
          >
            <Text style={styles.buttonText}>DSA Self Onboarding</Text>
          </TouchableOpacity>

        

        {/* Bank Cards Section */}
        <View style={styles.bankCardContainer}>
          {/* SBI Bank Codes Section */}
          <View style={styles.bankCard}>
            <Sbi />
          </View>
          {/* BOI Bank Codes Section */}
          <View style={styles.bankCard}>
            <Boi />
          </View>
        </View>
      </View>

      <ModalWithOptions
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

    </ScrollView>

    
  );
};

const styles = StyleSheet.create({
  main: {
    marginTop: 50,
  },
  headerContainer: {
    width: "100%",
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
  },
  container: {
    backgroundColor: "#F5F5F5",
    width: "100%",
    paddingHorizontal: 20,
  },
  earningsContainer: {
    width: "100%",
    alignItems: "center",
    fontSize: 20,
    marginTop: -35,
  },
  bankcodescontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 15,
    shadowColor: "#000",
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: "#21427",
    elevation: 3, // For Android shadow
  },
  backgroundImage: {
    width: "100%",
    flex: 1,
    marginTop: -40,
    justifyContent: "flex-end", // Position the button at the bottom
    alignItems: "center", // Center the button horizontally
  },
  createLeadButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 30,
    alignItems: "center",
    width: "80%",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: -130,
    marginBottom: 20, // Adjust this to move the button higher or lower
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bankCardContainer: {
    width: "100%",
    height: "100%",
    marginTop: 25,
  },
  bankCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
});

export default HomeScreen;
