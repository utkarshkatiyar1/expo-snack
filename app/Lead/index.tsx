import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Modal,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadButton from "@/components/uploadButton";
import { FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setBillingData, setFormData } from "@/store/formSlice";
import { BillingCompanyParams } from "@/api/dsaOnboard";
import { useToast } from 'react-native-toast-notifications';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { getProfile } from "@/api/profile";
import { LeadParams } from "@/utils/type";
import { createLead, editLead } from "@/api/lead";
import { updateLead } from "@/store/applicationSlice";
import { useIsFocused } from "@react-navigation/native";
import { setRole } from "@/store/profile";
import { Ionicons } from "@expo/vector-icons";


interface FormData {
  processed_by: string;
  full_name: string;
  pan_number: string;
  loan_amount: string;
  contact_number: string;
  employment_type: string;
  loan_product: string;
  subLoan_type: string;
  notes: string;

}

// const defaultFormData: FormData = {
//   processed_by: "self",
//   full_name: "",
//   pan_number: "",
//   loan_amount: "",
//   contact_number: "",
//   employment_type: "salaried",
//   loan_product: "",
//   subLoan_type:"",
//   notes:"",
// };

const Index: React.FC = () => {
  const firstFormData = useLocalSearchParams();
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const lead = useSelector((state: RootState) => state.application.lead);
  const defaultFormData: FormData = {
    processed_by: lead?.processing_by || "",
    full_name: lead?.name || "",
    pan_number: lead?.pan || "",
    loan_amount: lead?.loan_amount.toString() || "",
    contact_number: lead?.phone_number || "",
    employment_type: lead?.employment_type || "",
    loan_product: lead?.loan_type?.name || "",
    subLoan_type: lead?.sub_loan_type || "",
    notes: lead?.notes || "",
  };
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>(
    { defaultValues: defaultFormData }
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const { purpose } = useLocalSearchParams();
  console.log("purpose", purpose);
  const toaster = useToast();



  const [dsa_id, setDsa_id] = useState<number | null>(null);
  const [loanModal, setloanModal] = useState(false);
  const [selectCompanyType, setSelectCompanyType] = useState<string | null>(
    null
  );
  const [InsuranceValue, setInsuranceValue] = useState('0');
  const [inputValue, setInputValue] = useState('0');

  const openModal = () => {
    setloanModal(true);
  };
  const closeModal = () => {
    setloanModal(false);
  };

  const handleSelect = (keyData: string) => {
    setSelectCompanyType(keyData);
    closeModal();
  };

  useEffect(() => {
    if (lead?.loan_type?.id) {
      setSelectCompanyType(lead.loan_type.display_name);
      setValue("loan_product", lead.loan_type.id.toString());
    }

  }, []);

  const formatAmount = (value :string) => {
    console.log("value",value);
    if (!value) return '';
  
    // Remove all non-numeric characters (like spaces, commas)
    const rawValue = value.replace(/\D/g, '');
  
    // Convert the number to a float for easier manipulation
    const numValue = parseFloat(rawValue);
  
    if (isNaN(numValue)) return '';
  
    let formattedValue = '';
  
    if (numValue >= 10000000) {
      // More than or equal to 1 crore
      formattedValue = (numValue / 10000000).toFixed(2) + ' Cr';
    } else if (numValue >= 100000) {
      // More than or equal to 1 lakh but less than 1 crore
      formattedValue = (numValue / 100000).toFixed(2) + ' L';
    } else if (numValue >= 1000) {
      // More than or equal to 1000 but less than 1 lakh
      formattedValue = (numValue / 1000).toFixed(2) + ' K';
    } else {
      // For values less than 1000, show the exact number
      formattedValue = numValue.toString();
    }
  
    return formattedValue;
  };



  const onSubmit = async (data: FormData) => {

    const requestBody: LeadParams = {
      dsa_id: dsa_id ?? 0, // Provide a default value if dsa_id is null
      employment_type: data.employment_type,
      loan_amount: parseInt(data.loan_amount),
      loan_type_id: Number(data.loan_product), // Provide a default value if loan_type_id is null
      name: data.full_name,
      notes: data.notes,
      pan: data.pan_number,
      phone_number: data.contact_number,
      processing_by: data.processed_by,
      sub_loan_type: data.subLoan_type
    }

    if (purpose === "create") {
      createLead(requestBody,toaster).then((response) => {
        if (response) {
          console.log("responseCreated", response);
          dispatch(updateLead(response.data.lead));
        }
      }).catch((error) => {
        console.log("error", error);
      });
      router.replace({
        pathname: "/Lead/application",
        params: { purpose: "create" }
      });

    }
    else if (purpose === "edit") {
      try {
        if (lead?.id) {
          const response = await editLead(lead.id.toString(), requestBody,toaster);
          console.log("responseEdit", response);
          // dispatch(updateLead(response.data.lead));
        }
      }
      catch (error) {
        console.log("error", error);
      }
      router.replace('../Lead/applicationList');

    }

    console.log("Request Body", requestBody);
  };

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
  
    getProfile(toaster).then((response) => {

      if (response) {
        console.log("responseProfile", response, "id", response.id);
        if (response.linked_employee !== null) {
          dispatch(setRole("internal_employee"))
        }
        setDsa_id(response.id);
      }
    });

  }, []);

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Entypo
            name="chevron-left"
            size={24}
            color="black"
            style={{ marginRight: 5, marginTop: 2 }} // Optional styling for spacing
            onPress={() => {
              // You can add custom navigation logic here if needed
              router.back(); // Ensure 'navigation' is available in your scope
            }}
          />
        </TouchableOpacity>

        {purpose === "create" ? <Text style={styles.headerTitleStyle}>Create New Lead</Text> : <Text style={styles.headerTitleStyle}>Edit Lead</Text>}
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}

        <Text style={styles.fieldHeader}>Processing done by</Text>
        <Controller
          control={control}
          name="processed_by"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {['self', 'loan network'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>{(option.replace('_', ' ')).toLocaleUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />


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
            />
          )}
          name="full_name"
        />
        {errors.full_name && (
          <Text style={styles.error}>Company Name is required</Text>
        )}

        <Text style={styles.fieldHeader}>PAN Number</Text>
        <Controller
          control={control}
          rules={{
            required: "PAN number is required", // Error message for empty input
            pattern: {
              value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN number regex
              message: "Enter a valid PAN number", // Error message for invalid format
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert text to uppercase
              value={value} // Display value in uppercase
              // placeholder="Enter your PAN number"
              maxLength={10} // Limit to 10 characters
              autoCapitalize="characters"
            />
          )}
          name="pan_number"
        />
        {errors.pan_number && (
          <Text style={styles.error}>{errors.pan_number.message}</Text>
        )}

        <View style={{display:"flex", flexDirection:"row",justifyContent:"space-between"}}>
          <Text style={styles.fieldHeader}>Loan Amount Needed</Text>
          {InsuranceValue&&<Text style={styles.fieldHeader}>{InsuranceValue}</Text>}
        </View>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={(text) => {
                setInputValue(text); // Update input value as user types
                const formattedText = formatAmount(text); // Format the input as user types
                setInsuranceValue(formattedText); // Update formatted value to display above input
                onChange(text);  // Pass raw value to react-hook-form
              }}
              value={value}
              keyboardType="numeric"
            // placeholder="Enter your Address"
            />
          )}
          name="loan_amount"
        />
        {errors.loan_amount && (
          <Text style={styles.error}>Billing Address is required</Text>
        )}

        <Text style={styles.fieldHeader}>Contact Number</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              // placeholder="Enter your Pincode"
              maxLength={10}
            />
          )}
          name="contact_number"
        />
        {errors.contact_number && (
          <Text style={styles.error}>Billing Pincode is required</Text>
        )}

        <Text style={styles.fieldHeader}>Employment Type</Text>
        <Controller
          control={control}
          name="employment_type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {['salaried', 'self_employed'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>{(option.replace('_', ' ')).toLocaleUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />







        <Text style={styles.fieldHeader}>Loan Product</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View >
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal()}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {selectCompanyType}
                </Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={loanModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal()}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.loan_types}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.id); // Return city index as value
                            handleSelect(item.display_name); // Set city label
                          }}
                        >
                          <Text style={styles.cityText}>
                            {item.display_name}
                          </Text>
                        </TouchableOpacity>
                      )}
                      style={{ width: "100%", margin: 10 }}
                    />
                  </View>
                </View>
              </Modal>
            </View>
          )}
          name="loan_product"
        />
        {errors.loan_product && (
          <Text style={styles.error}>Company Type is required</Text>
        )}


        <Text style={styles.fieldHeader}>Sub Loan Type</Text>
        <Controller
          control={control}
          name="subLoan_type"

          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert to uppercase
              value={value}
              // placeholder="Enter your GST number"
              maxLength={15} // Limit input to 15 characters
              autoCapitalize="characters" // Convert text to uppercase
            />
          )}
        />
        {errors.subLoan_type && (
          <Text style={styles.error}>{errors.subLoan_type.message}</Text>
        )}

        <Text style={styles.fieldHeader}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert to uppercase
              value={value}
              // placeholder="Enter your GST number"
              maxLength={15} // Limit input to 15 characters
              autoCapitalize="characters" // Convert text to uppercase
            />
          )}
        />
        {errors.notes && (
          <Text style={styles.error}>{errors.notes.message}</Text>
        )}



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
          {purpose === "create" ? <Text style={styles.buttonText}>Create Application</Text> : <Text style={styles.buttonText}>Update</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fe",
    flex: 1,
    flexDirection: "column"
  },
  textContainer: {
    flex: 1, // Ensure text takes up available space
  },
  formContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
    // Add padding to prevent content from hiding behind buttons
  },
  uploadButtonSelected: {
    alignSelf: "flex-end", // Move to the right when selected
    backgroundColor: "#ebeff6", // Change background color
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  headerTitleStyle: {
    fontSize: 20, // Adjust the font size
    fontWeight: 'light', // Make the text bold
    color: 'grey', // Change the text color // Center the text (might not work in all cases)
  },
  uploadFieldHeader: {
    fontSize: 16,
    color: "#666666",
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
  fieldSubHeader: {
    fontSize: 14,
    marginBottom: 10,
    color: "#808080",
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
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  buttonNext: {
    flex: 1,
    backgroundColor: "#007AFF", // Green for Next
    padding: 10,
    marginLeft: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left", // Aligns text to the left
    alignSelf: "flex-start", // Ensures the text takes up space only as much as it needs
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  uploadButton: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 10,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  uploadText: {
    color: "#007AFF",
    marginLeft: 5,
  },
  uploadOptionText: {
    color: "black",
    textAlign: "left",
    fontWeight: "normal",
    width: "90%",
    fontSize: 18,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    height: "40%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  optionButton: {
    marginVertical: 1,
    flex: 1,
    width: "100%",
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e4e2",
    width: "100%",
  },
  uploadContainerItems: {
    padding: 10,
    margin: 10,
  },
  uploadContainer: {
    flex: 1,
    marginBottom: 15,
  },

  selector: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 10,
    flex: 1,
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
  closeButton: {
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioCircle: {
    height: 24, // Increased for better visibility
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center', // Center the inner circle
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
  },
  selectedRadioCircle: {
    backgroundColor: '#007BFF', // Not needed now, inner circle indicates selection
  },
  radioText: {
    fontSize: 16,
  },
});

export default Index;
