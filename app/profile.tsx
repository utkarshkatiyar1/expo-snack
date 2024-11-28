import React, { useEffect, useState  } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getProfile } from "../api/profile"; // Ensure to import the getProfile function
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useToast } from "react-native-toast-notifications";


interface Employee {
  active: boolean;
  display_role: string;
}

interface Profile {
  name: string;
  role: string | null;
  mobile_number: string;
  email: string;
  display_role: string;
  linkedEmployee: Employee | null;
}

const ProfileScreen = () => {
  const router = useRouter();
  const toaster = useToast(); // Get toaster instance
  const [profile, setProfile] = useState<Profile>({
    name: "",
    role: null,
    mobile_number: "",
    email: "",
    display_role: "",
    linkedEmployee: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile(toaster);
        console.log("Profiledata", data);
        if (data) {
          setProfile({
            name: data.name || "N/A",
            role: data.role || null,
            mobile_number: data.mobile_number || "N/A",
            email: data.email || "N/A",
            // Use display_role from linked_employee if active, otherwise fall back to assigned_employee or user role
            display_role: data.linked_employee?.active
              ? data.linked_employee.display_role
              : data.display_role || "N/A",
            linkedEmployee: data.linked_employee || null, // Ensure linkedEmployee is part of the profile
          });
        }
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleBankCode = () => {
    router.push("/bankcodes");
  };

  const handleCommissionstructure = () => {
    router.push("../profiledata/commissionstructure");
  };

  const handleBillingcompanies = () => {
    router.push("../profiledata/Billingcompany");
  };

  const handleLogout = async () => {
    try {
      // Retrieve the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem("auth_token"); // Make sure this is the key you used for storing the token

      // Make the API request to logout with the token
      const response = await axios.get(
        "https://api-staging.loannetwork.app/api/logout",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      // Check if the response is successful
      if (response.status === 200) {
        // Remove the active status from AsyncStorage
        await AsyncStorage.removeItem("auth_token");

        alert("You have been logged out successfully.");

        // Redirect the user to the Home screen
        router.replace("/");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleContactSupport = () => {
    // Add your contact support functionality here
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.info}>Name</Text>
      {profile.linkedEmployee?.active ? (
        <>
          <Text style={styles.label}>
            {profile.linkedEmployee.display_role}
          </Text>
          <Text style={styles.info}>Role</Text>
        </>
      ) : profile.linkedEmployee === null && profile.role !== "admin" ? (
        <>
          <Text style={styles.label}>{profile.display_role}</Text>
          <Text style={styles.info}>Role</Text>
        </>
      ) : null}
      <Text style={styles.label}>{profile.mobile_number}</Text>
      <Text style={styles.info}>Contact number</Text>
      <Text style={styles.label}>{profile.email}</Text>
      <Text style={styles.info}>Email ID</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          handleCommissionstructure();
        }}
        activeOpacity={1}
      >
        <Text style={styles.optionText}>Commission Structure</Text>
        <Ionicons name="chevron-forward" size={25} color="#007bff"  />

      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          handleBankCode();
        }}
        activeOpacity={1}

      >
        <Text style={styles.optionText}>Bank Codes</Text>
        <Ionicons name="chevron-forward" size={25} color="#007bff"  />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          handleBillingcompanies();
        }}
        activeOpacity={1}

      >
        <Text style={styles.optionText}>Billing Companies</Text>
        <Ionicons name="chevron-forward" size={25} color="#007bff"  />
      </TouchableOpacity >

      <Text style={styles.supportText}>Facing Trouble?<Text style={{color: '#007bff', fontWeight: '500'}} onPress={handleContactSupport}> Contact Support</Text></Text>


      <TouchableOpacity
       style ={{flexDirection: 'row', justifyContent: 'flex-start', marginTop: 25}} onPress={ handleLogout}  activeOpacity={1}
      >
        <Ionicons name="log-out-outline" size={24} color="#ff4d4d"  />
        <Text style={styles.logoutText}>   Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version: 1.0.95</Text>
    </ScrollView>
    <View style={styles.versionContainer}>
    <Text style={styles.version}>Version: 1.0.95</Text>
  </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FE",
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 40,
  },
  info: {
    fontSize: 16,
    marginTop: 10,
    color: "gray",
  },
  option: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
    marginTop: 40,
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",

  },
  supportText: {
    fontSize: 16,
    color: "gray",
    marginTop: 40,
  },

  logoutText: {
    color: "#ff4d4d",
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 50,
  },
  versionContainer: {
    position: "absolute", 
    bottom: 0, 
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F8F9FE",
    paddingVertical: 10,
  },
  version: {
    fontSize: 18,
    color: "#888",
  },
});

export default ProfileScreen;
