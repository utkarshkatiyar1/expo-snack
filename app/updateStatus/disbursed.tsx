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
import { useToast } from "react-native-toast-notifications";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { XMLParser } from "fast-xml-parser";
import { getPresignedUrl, uploadToS3 } from "@/api/uploaddoc";
import { DisbursementDetailsParams, updateToDisbursed } from "@/api/lead";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DevSettings } from 'react-native';
interface FormData {
  disbursal_type: string;
  disbursement_amount: string;
  payout_on: string;
  date_of_disbursement: string;
  lan_number: string;
  otc_cleared: string;
  pdd_cleared: string;
  category: string|null;
  branch_code: string;
}

const defaultValues : FormData = {
  disbursal_type: "Full",
  disbursement_amount: "",
  payout_on: "Disbursed Amount",
  date_of_disbursement: "",
  lan_number: "",
  otc_cleared: "Yes",
  pdd_cleared: "Full",
  category: "Loan",
  branch_code:""
};


const Disbursed: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>(
    {
      defaultValues,
    }
  );
  const router = useRouter();
  const toaster = useToast();
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const {application,error} = useSelector((state: RootState) => state.application);
  const [disbursementImage, setDisbursementImage] = useState<string | null>(null);
  const [bankerConfirmationImage, setbankerConfirmationImage] = useState<string | null>(null);
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [modalVisible2, setModalVisible2] = useState<boolean>(false);

  const [disbusementUploadSelected, setDisbursementUploadSelected] = useState<boolean>(false);
  const [bankerUploadSelected, setBankerUploadSelected] = useState<boolean>(false);
  const [disbursedAmount, setDisbursedAmount] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleUpload = async (title: string) => {
    if (title === "disbursement") {
      setModalVisible1(true);
      setDisbursementUploadSelected(true);
    } else {
      setModalVisible2(true);
      setBankerUploadSelected(true);
    }
  };
 

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
    const documents = [
      {
        field: "disbursement_letter",
        name: "disbursement_letter",
        uri: disbursementImage,
      },
      { field: "banker's_Confirmation_letter", name: "banker_confirmation_letter", uri: bankerConfirmationImage },
     
    ];

    const keys: { [key: string]: string } = {}; // Object to store keys for each uploaded document

    // Step 4: Loop through documents and upload each one sequentially
    for (const doc of documents) {
      if (doc.uri) {
        const extn = doc.uri.split(".").pop(); // Extract file extension
        const presignedUrl = await getPresignedUrl(
          `s3/img`,
          `${doc.name}.${extn}`
        );
        console.log(`Presigned URL for ${doc.name} fetched`);

        const uploadedDoc = await uploadToS3({
          uploadUrl: "https://lnetwork-staging.s3-accelerate.amazonaws.com",
          uri: doc.uri,
          name: `${doc.name}.${extn}`,
          payload: presignedUrl.postForm,
        });

        // console.log(`${doc.name} uploaded to S3`);

        // Parse the XML response to extract the S3 key
        const parser = new XMLParser();
        const res = parser.parse(uploadedDoc);
        const key = res.PostResponse.Key;

        // console.log(`${doc.name} S3 Key:`, key);

        // Store the key in the keys object
        keys[doc.field] = key;
      } else {
        console.warn(`${doc.name} is missing, skipping upload.`);
      }
    }
       console.log("disbursal  data", data);

    const requestBody: DisbursementDetailsParams = {
        commission_on: data.payout_on==="Disbursed Amount" ? "disbursal_amount" : "sanctioned_amount",
        disbursement_amount :Number(data.disbursement_amount),
        disbursement_date: data.date_of_disbursement,
        disbursement_type: data.disbursal_type==="Full" ? "full" : "partial",
        documents: [
          { localDoc:true,
            type: "disbursement_letter",
            url: keys["disbursement_letter"]
          },
           { localDoc:true,
             type: "bankers_confirmation",
             url: keys["banker's_Confirmation_letter"]
          }
        ],
        loan_account_number: data.lan_number,
        otc_cleared: data.otc_cleared==="Yes",
        pdd_cleared: data.pdd_cleared === "Full",
    };
    console.log("disbursal data", requestBody);   
   

    if (application && application.id) {
      const response = await updateToDisbursed(application.id.toString(), requestBody, toaster);
      console.log("responseAfterdisbursementApi", response);
      console.log("disburseddata", requestBody);
    } else {
      console.error("Application is null or does not have an id");
    }
    // router.push("../updateStatus/disbursed");
    // router.replace({
    //   pathname: '../../(toptabs)',
    //   params: { applicationId: JSON.stringify(application?.id) },
    // });
    router.back();
  };


  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}

        <Text style={styles.mainHeader}>
          Please provide below details to updated the application status to
          Disbursed
        </Text>

        <Text style={styles.fieldHeader}>Disbursal Type</Text>
        <Controller
          control={control}
          name="disbursal_type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Full", "Partial"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

{application?.lending_partner.slug==="sbi" && <><Text style={styles.fieldHeader}>Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Loan", "Rinn Raksha"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        </>}

<View style={styles.row} >
        <Text style={styles.fieldHeader}>Sanctioned Amount</Text>
        {disbursedAmount&&<Text style={styles.fieldHeader}> {disbursedAmount}</Text>}
        </View>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
            style={styles.input}
            onBlur={onBlur}
            maxLength={10}
            onChangeText={(text) => {
              // Update input value as user types
              const formattedText = formatAmount(text); // Format the input as user types
              setDisbursedAmount(formattedText); // Display the formatted value
              onChange(text);  // Pass raw value to react-hook-form
            }}
            value={value} // Display the raw input value
            keyboardType="numeric" // Only allow numeric input
          />
          )}
          name="disbursement_amount"
        />
        {errors.disbursement_amount && (
          <Text style={styles.error}>Disbursment Amount is required</Text>
        )}

        <Text style={styles.fieldHeader}>Payout On</Text>
        <Controller
          control={control}
          name="payout_on"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Disbursed Amount", "Sanctioned Amount"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text style={styles.fieldHeader}>Date of Disbursement</Text>
        <Controller
        control={control}
        name="date_of_disbursement"
        rules={{ required: true }}
        render={({ field: { onChange,onBlur, value } }) => (
          <View  style={styles.dateTimePicker} >
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              // placeholder="Enter your Pincode"
              maxLength={10}
            />
            <TouchableOpacity style={{marginRight: 20,}} onPress={() => setShowPicker(true)}>
              <Entypo name="chevron-down" size={24} color="black"  />
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date" // Use 'datetime' or 'time' for different modes
                display="default"
                onChange={(events, date) => {
                  if (Platform.OS !== 'ios') {
                    setShowPicker(false); // Close picker on Android after selection
                  }
                  if (date) {
                    setSelectedDate(date);
                    onChange(date.toISOString().split('T')[0]); // Format as 'YYYY-MM-DD'
                  }
                }}
              />
            )}
          </View>
        )}
      />
        {errors.date_of_disbursement && (
          <Text style={styles.error}>Date of disbursment is required</Text>
        )}

        <Text style={styles.fieldHeader}>LAN:</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert text to uppercase
              value={value} // Display value in uppercase
              // placeholder="Enter your PAN number"
           
            />
          )}
          name="lan_number"
        />
        {errors.lan_number && (
          <Text style={styles.error}>{errors.lan_number.message}</Text>
        )}

{application?.lending_partner.slug==="sbi" && <><Text style={styles.fieldHeader}>Branch Code</Text>
        <Controller
          control={control}
          name="branch_code"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert text to uppercase
              value={value} // Display value in uppercase
              // placeholder="Enter your PAN number"
           
            />
          )}
        />
        </>}

        <Text style={styles.fieldHeader}>OTC Cleared</Text>
        <Controller
          control={control}
          name="otc_cleared"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Yes", "No"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text style={styles.fieldHeader}>PDD Cleared</Text>
        <Controller
          control={control}
          name="pdd_cleared"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Full", "Partial"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() => onChange(option)}
                >
                  <View style={styles.radioCircle}>
                    {value === option && <View style={styles.innerCircle} />}
                  </View>
                  <Text style={styles.radioText}>
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <View style={styles.uploadContainer}>
          <View style={disbusementUploadSelected && styles.container}>
            <View style={disbusementUploadSelected && styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
                Upload Disbursement Letter
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                !disbusementUploadSelected && styles.uploadButton,
                disbusementUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload("disbursement")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible1}
            setModalVisible={setModalVisible1}
            setUrl={setDisbursementImage}
            title={"disbursement_letter"}
            setIsSelected={setDisbursementUploadSelected}
          />
        </View>

        <View style={styles.uploadContainer}>
          <View style={bankerUploadSelected && styles.container}>
            <View style={bankerUploadSelected && styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
                Upload Banker's confimation
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                !bankerUploadSelected && styles.uploadButton,
                bankerUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload("banker_confirmation")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible2}
            setModalVisible={setModalVisible2}
            setUrl={setbankerConfirmationImage}
            title={"banker_confirmation"}
            setIsSelected={setBankerUploadSelected}
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
          <Text style={styles.buttonText}>Update Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ebeff6",
    flex: 1,
    flexDirection: "row",
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
  row:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  mainHeader: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    color: "#666666",
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
    color: "#fff",
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
    marginTop: 10,
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
    flexDirection: "row",
    marginBottom: 10,
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
    fontSize: 14,
  },
  dateTimePicker:{
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
  },
});

export default Disbursed;
