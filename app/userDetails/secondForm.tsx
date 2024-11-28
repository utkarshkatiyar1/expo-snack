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

interface FormData {
  company_name: string;
  billing_address: string;
  billing_pincode: string;
  billing_city: number;
  place_of_supply: string;
  company_type: string;
  email: string;
  gst_number: string;
  pan_number: string;
}

const SecondForm: React.FC = () => {
  const firstFormData = useLocalSearchParams();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const router = useRouter();
  const dispatch = useDispatch();
  const toaster =useToast();
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const [panImage, setPanImage] = useState<string | null>(null);
  const [gstImage, setGstImage] = useState<string | null>(null);
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [modalVisible2, setModalVisible2] = useState<boolean>(false);
  const [cityModal, setCityModal] = useState(false);
  const [stateModal, setStateModal] = useState(false);
  const [companyModal, setCompanyModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedstate, setSelectedstate] = useState<string | null>(null);
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
    if (data === "city") {
      setCityModal(true);
    } else if (data === "state") {
      setStateModal(true);
    } else {
      setCompanyModal(true);
    }
  };
  const closeModal = (data: string) => {
    if (data === "city") {
      setCityModal(false);
    } else if (data === "state") {
      setStateModal(false);
    } else {
      setCompanyModal(false);
    }
  };

  const handleSelect = (keyData: string, key: string) => {
    if (key === "city") {
      setSelectedCity(keyData);
      closeModal("city");
    } else if (key === "state") {
      setSelectedstate(keyData);
      closeModal("state");
    } else {
      setSelectCompanyType(keyData);
      closeModal("company");
    }
  };

  const validateGstinContainsPan = (gstin: string, pan: string): boolean => {
    if (gstin.length !== 15 || pan.length !== 10) {
      return false; // Return false if lengths are not as expected
    }
    const extractedPanFromGstin = gstin.substring(2, 12); // Extracting characters from index 2 to 11
    return extractedPanFromGstin === pan; // Check if the extracted PAN matches the provided PAN
  };

  const onSubmit = async (data: FormData) => {
    const billing_company: Partial<BillingCompanyParams> = {
      address: data.billing_address,
      bill_to_city_id: data.billing_city,
      bill_to_pincode: data.billing_pincode,
      company_type: data.company_type,
      email: data.email,
      gst_doc: gstImage as string,
      gstin: data.gst_number,
      name: data.company_name,
      pan: data.pan_number,
      pan_doc: panImage as string,
      place_of_supply_id: data.place_of_supply,
    };

    if(data.place_of_supply!==data.gst_number.substring(0,2)){
      toaster.show(`GST number doesn't contain Place of Supply!`, {
        type: 'error',
      });
      return; 
    }
    if(validateGstinContainsPan(data.gst_number, data.pan_number) === false){
      toaster.show('GST number does not match with PAN number!', {
        type: 'error',
      });
      return;
    }
    if(!billing_company.gst_doc && !billing_company.pan_doc){
    toaster.show('Please upload all documents!', {
      type: 'error',
    });
    return;
  }

  else if(!billing_company.gst_doc){
    toaster.show('Please upload GST document!', {
      type: 'error',
    });
    return;
  }
  else if(!billing_company.pan_doc){
    toaster.show('Please upload PAN document!', {
      type: 'error',
    });
    return;
  }

    dispatch(setBillingData(billing_company));
    router.push({
      pathname: "../userDetails/thirdForm",
      params: { ...firstFormData, ...data, panImage, gstImage },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}
        <Text style={styles.fieldHeader}> Company Name</Text>
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
          name="company_name"
        />
        {errors.company_name && (
          <Text style={styles.error}>Company Name is required</Text>
        )}

        <Text style={styles.fieldHeader}>Billing Address</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              // placeholder="Enter your Address"
            />
          )}
          name="billing_address"
        />
        {errors.billing_address && (
          <Text style={styles.error}>Billing Address is required</Text>
        )}

        <Text style={styles.fieldHeader}>Billing Pincode</Text>
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
              maxLength={6}
            />
          )}
          name="billing_pincode"
        />
        {errors.billing_pincode && (
          <Text style={styles.error}>Billing Pincode is required</Text>
        )}

        <Text style={styles.fieldHeader}>Billing City</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View >
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("city")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {selectedCity}
                </Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>
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
                            onChange(item.id); // Return city index as value
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
          name="billing_city"
        />
        {errors.billing_city && (
          <Text style={styles.error}>City is required</Text>
        )}

        <Text style={styles.fieldHeader}>Place of Supply</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View >
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("state")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {selectedstate}
                </Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={stateModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("state")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.list_place_of_supply}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.gst_code); // Return city index as value
                            handleSelect(
                              `${item.name} ${"-"}${item.gst_code}`,
                              "state"
                            ); // Set city label
                          }}
                        >
                          <Text style={styles.cityText}>{`${item.name} ${"  "}${
                            item.gst_code
                          }`}</Text>
                          
                        </TouchableOpacity>
                      )}

                      style={{ width: "100%", margin: 10 }}
                    />
                  </View>
                </View>
              </Modal>
            </View>
          )}
          name="place_of_supply"
        />
        {errors.place_of_supply && (
          <Text style={styles.error}>Place of Supply is required</Text>
        )}

        <Text style={styles.fieldHeader}>Company Type</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View >
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("company")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {selectCompanyType }
                </Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={companyModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("company")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.company_types}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.name); // Return city index as value
                            handleSelect(item.display_name, "company"); // Set city label
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
          name="company_type"
        />
        {errors.company_type && (
          <Text style={styles.error}>Company Type is required</Text>
        )}

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

        <Text style={styles.fieldHeader}>GST Number</Text>
        <Controller
          control={control}
          name="gst_number"
          rules={{
            required: "GST number is required", // Error message for empty input
            pattern: {
              value:
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
              message: "Enter a valid GST number", // Error message for invalid format
            },
          }}
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
        {errors.gst_number && (
          <Text style={styles.error}>{errors.gst_number.message}</Text>
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
        <View style={styles.uploadContainer}>
        <View style={panUploadSelected&&styles.container}>
            <View style={panUploadSelected&&styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
              Upload PAN Document
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                  !panUploadSelected&&styles.uploadButton,
                  panUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={()=>handleUpload("pan")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible1}
            setModalVisible={setModalVisible1}
            setUrl={setPanImage}
            title={"pan"}
            setIsSelected={setPanUploadSelected}
          />
        </View>

        <View style={styles.uploadContainer}>
        <View style={gstUploadSelected&&styles.container}>
            <View style={gstUploadSelected&&styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
              Upload GST Document
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                  !gstUploadSelected&&styles.uploadButton,
                  gstUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={()=>handleUpload("gst")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible2}
            setModalVisible={setModalVisible2}
            setUrl={setGstImage}
            title={"gst"}
            setIsSelected={setGstUploadSelected}
          />
        </View>
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
    flexDirection:"row"
  },
  textContainer: {
    flex: 1, // Ensure text takes up available space
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    // Add padding to prevent content from hiding behind buttons
  },
  uploadButtonSelected: {
    alignSelf: "flex-end", // Move to the right when selected
    backgroundColor:"#ebeff6", // Change background color
    marginBottom:5,
    flexDirection:"row",  
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
    borderRadius: 5,
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  buttonNext: {
    flex: 1,
    backgroundColor: "#007AFF", // Green for Next
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
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
  uploadButton:{
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff",
    marginBottom: 10,
    flex:1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  uploadText:{
     color:"#007AFF",
     marginLeft:5,
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
});

export default SecondForm;
