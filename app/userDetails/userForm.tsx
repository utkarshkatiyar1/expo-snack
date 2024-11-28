import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useForm, Controller, Form, set } from "react-hook-form";
import { Picker } from "@react-native-picker/picker"; // Correct import for Picker
import { useRouter } from "expo-router";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { basicDeatilas, basicDeatilsParams, getMetadata } from "@/api/dsaOnboard";
import { cities } from '@/constants/Constant';
import { useDispatch } from 'react-redux';
import { setMetadata } from '@/store/metadataSlice'
import { setBillingData,setFormData } from '@/store/formSlice';
import Entypo from '@expo/vector-icons/Entypo';
import { useToast } from "react-native-toast-notifications";

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

interface FormData {
  name: string;
  email: string;
  city_id: number;
  organisationName: string;
  organisationAddress: string;
}
interface cityData {
  active: boolean;
  id: number;
  name: string;
}

const UserForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();
  const router = useRouter();
  const toaster = useToast(); // Get toaster instance
  const dispatch = useDispatch();
  const [fileUri, setFileUri] = useState<any | null>(null); // State to store the selected file URI

  const [cityModal, setCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [metaData, setMetaData] = useState<Metadata | null>(null);

  const openModal = (data: string) => {
    if (data === "city") {
      setCityModal(true);
    }
  };
  const closeModal = (data: string) => {
    if (data === "city") {
      setCityModal(false);
    }
  };

  const handleSelect = (keyData: string, key: string) => {
    if (key === "city") {
      setSelectedCity(keyData);
      closeModal("city");
    }
  };

  const fetchData = async () => {
    const response = await getMetadata(toaster);
    setMetaData(response.data);
    dispatch(setMetadata(response.data));
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Submit handler for both buttons
  const onSubmit = (data: FormData) => {
    const requestBody: basicDeatilsParams = {
      city_id: data.city_id,
      name: data.name,
      email: data.email,
      org_name: data.organisationName,
      org_address: data.organisationAddress,
    };
    // basicDeatilas(requestBody);
    dispatch(setFormData(requestBody));
    router.push({
      pathname: "../userDetails/secondForm",
      params: { ...data },
    });
  };

  // Handler for the Cancel button
  const handleCancel = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}
        <Text style={styles.fieldHeader}> Full Name</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              // placeholder="Enter your name"
            />
          )}
          name="name"
        />
        {errors.name && <Text style={styles.error}>Name is required</Text>}

        <Text style={styles.fieldHeader}>City</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View>
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("city")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {selectedCity }
                </Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>
              

              {/* Modal for city selection */}
              <Modal
                visible={cityModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("city")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.city}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.id); // Return city id as value
                            handleSelect(item.name, "city"); // Set city label
                          }}
                        >
                          <Text style={styles.cityText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                      style={{ width: "100%", margin: 10 }}
                    />
                  </View>
                </View>
              </Modal>
            </View>
          )}
          name="city_id"
        />
        {errors.city_id && <Text style={styles.error}>City is required</Text>}

        {/* Email Field */}
        <Text style={styles.fieldHeader}>Email Address</Text>
        <Controller
          control={control}
          rules={{
            required: true,
            pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // Simple email pattern
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              // placeholder="Enter your email"
            />
          )}
          name="email"
        />
        {errors.email && <Text style={styles.error}>Enter a valid email</Text>}

        {/* Age Dropdown (Picker) */}
        {/* College Field */}
        <Text style={styles.fieldHeader}>Organisation Name</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              // placeholder="Enter your Organisation Name"
            />
          )}
          name="organisationName"
        />
        {errors.organisationName && (
          <Text style={styles.error}>Organisation Name is required</Text>
        )}

        <Text style={styles.fieldHeader}>Organisation Address</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              // placeholder="Enter your Organisation Address"
            />
          )}
          name="organisationAddress"
        />
        {errors.organisationAddress && (
          <Text style={styles.error}>Organisation Address is required</Text>
        )}

        {/* Upload Button */}
      </ScrollView>

      {/* Fixed Buttons: Cancel and Next */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonNext}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ebeff6",
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    // Add padding to prevent content from hiding behind buttons
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  fieldHeader: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    color: "#666666",
    paddingBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 15,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff", // Add background color for visibility
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  buttonCancel: {
    flex: 1,
    backgroundColor: "#fff", // Red for Cancel
    padding: 10,
    marginRight: 10,
    borderRadius: 15,
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  buttonNext: {
    flex: 1,
    backgroundColor: "#007AFF", // Green for Next
    padding: 10,
    marginLeft: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedFileText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },

  selector: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 10,
    flex:1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectorText: {
    color: "#333",
    fontSize: 16,
  },
  modalContainer2: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "50%",
    backgroundColor: "white",

    borderRadius: 10,
    alignItems: "center",
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cityText: {
    fontSize: 18,
  },
});

export default UserForm;
