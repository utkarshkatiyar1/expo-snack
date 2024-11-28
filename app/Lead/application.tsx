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
  Switch,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadButton from "@/components/uploadButton";
import { FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setBillingData, setFormData } from "@/store/formSlice";
import { BillingCompanyParams } from "@/api/dsaOnboard";
import { useToast } from "react-native-toast-notifications";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getProfile } from "@/api/profile";
import { LeadApplicationParams } from "@/utils/type";
import { createLeadApplication, editApplication, financial_Institution } from "@/api/lead";


interface FormData {
  bank: string;
  bank_address: string;
  applicationId: string;
  is_from_external_dsa: boolean;
  external_dsa_id: string;
}

interface BankDetails {
  active: boolean;
  commission_on: string;
  email_domains: string[];
  id: number;
  logo: string;
  name: string;
  order: number;
  slug: string | null;
  type: string;
}



const Application: React.FC = () => {
  const {purpose} = useLocalSearchParams();
  console.log("purposeATApplication",purpose);
  // const leadIdString = Array.isArray(leadId) ? leadId[0] : leadId;
  const [bankDetails, setBankDetails] = useState<BankDetails[] | null>(null);
  const leadId = useSelector((state: RootState) => state.application.lead?.id);
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const applicationState = useSelector((state: RootState) => state.applicationEdit);
  console.log("leadId",leadId);
  const defaultValue: FormData = {
    // bankDetails?.find(item=> item.name===applicationState?.lending_partner?.name)?.id 
    bank: applicationState?.lending_partner?.name || "",
    bank_address: applicationState?.branch_name || "",
    applicationId: applicationState?.bank_application_id || "",
    is_from_external_dsa: applicationState?.is_from_external_dsa || false,
    external_dsa_id: applicationState?.external_dsa?.name || "",
  };
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>(
    { defaultValues: defaultValue }
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const toaster = useToast();

  useEffect(() => {
    if(applicationState?.lending_partner?.id){
      setValue("bank", applicationState?.lending_partner?.id?.toString());
      setSelectBank(applicationState?.lending_partner?.name);
    }
    if(applicationState?.bank_application_id){
      setApplicationIdLength(applicationState?.bank_application_id.length);
    }
  },[]);

  console.log("this can only save my life",applicationState);
  const [panImage, setPanImage] = useState<string | null>(null);
  const [gstImage, setGstImage] = useState<string | null>(null);
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [modalVisible2, setModalVisible2] = useState<boolean>(false);
  const [bankModal, setBankModal] = useState(false);
  const [selectBank, setSelectBank] = useState<string | null>(null);
  const [dsaModal, setDsaModal] = useState(false);
  const [selectDsa, setSelectDsa] = useState<string | null>(null);
  const [companyModal, setCompanyModal] = useState(false);
  const [selectCompanyType, setSelectCompanyType] = useState<string | null>(
    null
  );
  const [gstUploadSelected, setGstUploadSelected] = useState<boolean>(false);
  const [panUploadSelected, setPanUploadSelected] = useState<boolean>(false);
 
  const handleUpload = async (title: string) => {
    if (title === "pan") {
      setModalVisible1(true);
      setPanUploadSelected(true);
    } else {
      setModalVisible2(true);
      setGstUploadSelected(true);
    }
  };
  const openModal = (data: string) => {
    if (data === "bank") {
      setBankModal(true);
    } else if (data === "dsa") {
      setDsaModal(true);
    } else {
      setCompanyModal(true);
    }
  };
  const closeModal = (data: string) => {
    if (data === "bank") {
      setBankModal(false);
    } else if (data === "dsa") {
      setDsaModal(false);
    } else {
      setCompanyModal(false);
    }
  };

  const handleSelect = (keyData: string, key: string) => {
    if (key === "bank") {
      setSelectBank(keyData);
      closeModal("bank");
    } else if (key === "dsa") {
      setSelectDsa(keyData);
      closeModal("dsa");
    } else {
      setSelectCompanyType(keyData);
      closeModal("company");
    }
  };

  const onSubmit = async (data: FormData) => {

    console.log("Application Data", data);
    const requestBody: LeadApplicationParams = {
      bank_application_id: data.applicationId,
      branch_name: data.bank_address,
      lending_partner_id: Number(data.bank),
      is_from_external_dsa: data.is_from_external_dsa,
      external_dsa_id: data.is_from_external_dsa ? Number(data.external_dsa_id) : null,
      status: "sent_to_bank",
    };
    console.log("requestBody",requestBody);
    if(leadId){ 
      try {
        let result;
        if(purpose==="create"){
          result = await createLeadApplication(leadId?.toString(), requestBody, toaster);
        }
        else if(purpose==="edit"){
          if(applicationState?.id){
          result = await editApplication(applicationState?.id?.toString(), requestBody, toaster);
          }
        }
      } catch (error) {
        console.error("Error creating lead application:", error);
      } finally {
        // router.back(); // This will always run regardless of success or failure
         router.replace('../Lead/applicationList');
      }
      
    }
  
  //  console.log("resultapp",result);
  //  router.push("../../Lead/applicationList");
  // router.push({
  //   pathname: '../Lead/applicationList', // Navigate to the applicationList screen
  //   params: { title: "hii",applicationList: leadId}, // Pass dynamic title as parameter
  // });
  };

  const handleCancel = () => {
    router.back();
  };
  
  
 const [applicationIdLength, setApplicationIdLength] = useState(0); 
  const [isDsaEnabled, setIsDsaEnabled] = useState(false); // State for toggle

  useEffect(() => { 
    financial_Institution(toaster).then((data) => {
      console.log("data", data.data.lending_partners);  
      setBankDetails(data.data.lending_partners);      
    }).catch((error:any) => {
      console.log("error", error);
    });
  }, []);

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity  onPress={() => router.back()}>
        <Entypo
              name="chevron-left"
              size={24}
              color="black"
              style={{ marginRight: 5 ,marginTop:2}} // Optional styling for spacing
              onPress={() => {
                // You can add custom navigation logic here if needed
                router.back(); // Ensure 'navigation' is available in your scope
              }}
            />
        </TouchableOpacity>
       
       {purpose==="create"?<Text style={styles.headerTitleStyle}>Create New Application</Text>:<Text style={styles.headerTitleStyle}>Edit Details</Text>} 
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}

        <Text style={styles.fieldHeader}>Preferred Bank</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("bank")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>{selectBank||value}</Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={bankModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("bank")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={bankDetails}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.id); // Return city index as value
                            handleSelect(item.name, "bank"); // Set city label
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
          name="bank"
        />
        {errors.bank && <Text style={styles.error}>Bank Name is required</Text>}

        <Text style={styles.fieldHeader}>Branch Location</Text>
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
          name="bank_address"
        />
        {errors.bank_address && (
          <Text style={styles.error}>Company Name is required</Text>
        )}
        <View style={styles.row} >
        {/* <Text style={styles.fieldHeader}>Application ID</Text> */}
        {purpose==="create"?<Text style={styles.fieldHeader}>Application ID</Text>:<Text style={styles.fieldHeader}>LOS/RLMS ID</Text>} 
        {applicationIdLength>0&&<Text style={styles.fieldHeader}> {applicationIdLength} digits</Text>}
        </View>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={
                (text) => {
                  onChange(text);
                  setApplicationIdLength(text.length);
                }
              }
              value={value}
              // placeholder="Enter your Address"
            />
          )}
          name="applicationId"
        />
        {errors.applicationId && (
          <Text style={styles.error}>Billing Address is required</Text>
        )}

        
<View style={styles.toggleRow}>
  <Text style={styles.toggleLabel}>File Submitted Under Another DSA</Text>
  <Controller
    control={control}
    render={({ field: { onChange, value } }) => (
      <Switch
        value={value}
        onValueChange={() => {
          onChange(!value);
          setIsDsaEnabled(!isDsaEnabled);
        }}
        thumbColor={value ? '#fff' : '#fff'}  // Thumb color for ON (green) and OFF (red)
        trackColor={{
          true: '#1A63ED', // Track color when ON (light green)
          false: '#88898D' // Track color when OFF (light red)
        }}
        
      />
    )}
    name="is_from_external_dsa"
  />
</View>
       


{/* <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>File Submitted Under Another DSA</Text>
        <Switch value={isDsaEnabled} onValueChange={toggleDsa} />
      </View> */}

       
       {getValues("is_from_external_dsa") && 
       <>
       <Text style={styles.fieldHeader}>Select DSA</Text>
       <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("dsa")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>{selectDsa||value}</Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={dsaModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("dsa")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.external_dsa}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.id); // Return city index as value
                            handleSelect(item.name, "dsa"); // Set city label
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
          name="external_dsa_id"
        />
        </>
        }
        

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
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fe",
    flex: 1,
    flexDirection: "column",
  },
  textContainer: {
    flex: 1, // Ensure text takes up available space
  },
  row:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
  ,
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
    fontSize: 17,
    marginBottom: 5,
    marginTop: 15,
    color: "#88898D",
    paddingBottom: 5,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  headerTitleStyle: {
    fontSize: 20, // Adjust the font size
    fontWeight: 'medium', // Make the text bold
    color: '#595959', // Change the text color // Center the text (might not work in all cases)
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
    fontSize: 18,
    color:"#000",
    fontWeight:"medium"
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
    color: "#000",
    fontSize: 18,
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
    color: "#000",
    
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
    flexDirection: "row",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  radioCircle: {
    height: 24, // Increased for better visibility
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007BFF",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center", // Center the inner circle
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#007BFF",
  },
  selectedRadioCircle: {
    backgroundColor: "#007BFF", // Not needed now, inner circle indicates selection
  },
  radioText: {
    fontSize: 16,
  },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  toggleLabel: { flex: 1, fontSize: 17 ,color: "#666666"},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures spacing between label and switch
    marginVertical: 8,
  },
});

export default Application;
