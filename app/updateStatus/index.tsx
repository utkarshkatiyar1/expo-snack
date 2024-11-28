import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Touchable,
  Pressable,
  Image,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadButton from "@/components/uploadButton";
import { FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LoanDetailsParams, updateSanctioned } from "@/api/lead";
import { getFileUrl, getPresignedUrl, uploadToS3 } from "@/api/uploaddoc";
import { XMLParser } from "fast-xml-parser";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Document } from "@/store/applicationSlice";
import { setViewUrl } from "@/store/profile";

import { useToast } from "react-native-toast-notifications";

interface FormData {
  bank_rm: string;
  rm_phone: string;
  rm_email: string;
  rm_email_prefix: string;
  loan_insurance: string;
  sanctioned_amount: string;
  insurance_amount: string;
  sanction_letter: string;
  sanction_date: string;
}

// const defaultValues: FormData = {
//   bank_rm: "",
//   rm_phone: "",
//   rm_email: "",
//   rm_email_prefix: "",
//   loan_insurance: "Yes",
//   sanctioned_amount: "",
//   insurance_amount: "",
//   sanction_letter: "",
//   sanction_date: "",
// };

const Index: React.FC = () => {

 


  const { application, error } = useSelector((state: RootState) => state.application);
  const applicationEditState = useSelector((state: RootState) => state.applicationEdit);
  const {purpose, status} = useLocalSearchParams();
  console.log("purpose",applicationEditState?.documents);
  const defaultValues: FormData = {
    bank_rm: applicationEditState?.bank_rm_name|| "",
    rm_phone: applicationEditState?.bank_rm_phone_number|| "",
    rm_email:   applicationEditState?.bank_rm_email_address? `@${applicationEditState?.bank_rm_email_address?.split('@')[1]}` : application?.email_domains[0] || "",
    rm_email_prefix: applicationEditState?.bank_rm_email_address?.split('@')[0]|| "",
    loan_insurance: applicationEditState?.loan_insurance_added ? "Yes" : "No",
    sanctioned_amount: applicationEditState?.sanctioned_amount?.toString()|| "",
    insurance_amount: applicationEditState?.loan_insurance_amount?.toString()|| "",
    sanction_letter: applicationEditState?.documents?.find((doc) => doc.type === "sanctioned_letter")?.url|| "",
    sanction_date: applicationEditState?.sanctioned_date|| "",
  };

  useEffect(() => {
    if( applicationEditState?.sanctioned_amount?.toString()){
      const formattedText = formatAmount( applicationEditState?.sanctioned_amount?.toString()); 
      setSanctionedValue(formattedText); // Ensure it's formatted and displayed
    }

    if( applicationEditState?.loan_insurance_amount?.toString()){
      const formattedText = formatAmount( applicationEditState?.loan_insurance_amount?.toString()); 
      setInsuranceValue(formattedText); // Ensure it's formatted and displayed
    }


    }, []);
    
    
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>(
    { defaultValues }
  );
  const router = useRouter();

  const dispatch = useDispatch();

  const toaster = useToast(); // Get toaster instance

  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const [sanctionLetterImage, setSanctionLetterImage] = useState<string | null>(null);
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [emailModal, setEmailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [sanctionLetterUploadSelected, setSanctionLetterUploadSelected] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const [sanctionValue, setSanctionedValue] = useState('');
  const [InsuranceValue, setInsuranceValue] = useState('');
  const [insured, setInsured] = useState<boolean>();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [document, setDocument] = useState<string[] | null>();
  const [objectsArray, setObjectsArray] = useState<any>();
  const handleUpload = async () => {
      setModalVisible1(true);
      setSanctionLetterUploadSelected(true);
  };
  const openModal = () => { 
      setEmailModal(true);
  };
  const closeModal = () => {
      setEmailModal(false); 
  };

  const handleSelect = (keyData: string) => {
      setSelectedEmail(keyData);
      closeModal();
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

    let key="";
    console.log("sanctiondata", data);
    console.log("sanctionLetterImage", sanctionLetterImage);

    const extn = sanctionLetterImage?.split(".").pop(); // Extract file extension
    const presignedUrl = await getPresignedUrl(
      `s3/img`,
      `sanctionLetter.${extn}`
    );
    console.log(`Presigned URL for SanctionLetter has been fetched`);

    if (sanctionLetterImage) {
      const uploadedDoc = await uploadToS3({
        uploadUrl: "https://lnetwork-staging.s3-accelerate.amazonaws.com",
        uri: sanctionLetterImage,
        name: `sanctionLetter.${extn}`,
        payload: presignedUrl.postForm,
      });
      const parser = new XMLParser();
      const res = parser.parse(uploadedDoc);
      key = res.PostResponse.Key;
    } else {
      console.log("Sanction letter image is null");
    }
    const email= data.rm_email_prefix+data.rm_email;
    console.log("email",email);
    const loanDetails : LoanDetailsParams= {
     
        bank_rm_email_address: email,
        bank_rm_name: data.bank_rm,
        bank_rm_phone_number: data.rm_phone,
          documents:key?[
          {
            "localDoc":true,
            "type": "sanctioned_letter",
            "url": key
          }
        ] : objectsArray,
        loan_insurance_added: data.loan_insurance === "Yes" ? true : false,
        loan_insurance_amount: parseInt(data.insurance_amount) > 0 ? parseInt(data.insurance_amount) : 0,
        sanctioned_amount: parseInt(data.sanctioned_amount),
        // sanctioned_date: "2024-11-09",
        sanctioned_date: data.sanction_date,
        status: status==="Sanctioned" ? "sanctioned" : "disbursed",
      }

       console.log("loanDetails",loanDetails);
       console.log(application?.id, "This is Application ID");
       
     if (application?.id) {
       const response = await updateSanctioned(application.id.toString(), loanDetails, toaster);
       console.log("sanctionApiResponse", response);
       console.log("sanctionApirequest", loanDetails);
     } else {
       console.error("Application ID is undefined");
     }
    //  router.replace({
    //   pathname: '../../(toptabs)',
    //   params: { applicationId: JSON.stringify(application?.id) },
    // });
    router.back()
    // router.push("../(toptabs)/index");
  };

  const handleCancel = () => {
    router.back();
  };

  const handleClick = async (image: string | null) => {
    dispatch(setViewUrl(image || ""));
    router.push({
      pathname: "../../userDetails/ImageViewer",
      params: {
        doc: image,
      },
    });
 };

  useEffect(() => {
    // const arr:string[] = [];
    // if(applicationEditState?.documents){
    //   applicationEditState?.documents.map((doc: Document) => {
    //     if(doc.url)
    //        arr.push(doc?.url);
    //   })
    // }
    // console.log("arr",arr);
    if(applicationEditState?.documents){
    setSanctionLetterUploadSelected(true);
    }
    const urls = applicationEditState?.documents?.filter((doc) => doc.url).map((doc) => doc.url) || [];
   console.log("urls",urls);

   const objectsArrayVar = urls.map((key) => ({
    localDoc: true,
    type: "sanctioned_letter",
    url: key
  }));
  
  setObjectsArray(objectsArrayVar)

  
Promise.all(
  urls.map((key) => {
    if (key) {
      return getFileUrl(key).catch((error) => {
        console.error(`Error fetching URL for key: ${key}`, error);
        return null; // Handle error and return null
      });
    }
    return Promise.resolve(null); // Return a resolved promise with null if key is null
  })
).then((results) => {
  const validUrls = results.filter((url): url is string => url !== null); // Remove null values
  console.log("All valid URLs:", validUrls);
  // setDocUrl(validUrls); // Update state
  setDocument(validUrls as string[]);
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
       
       {purpose==="create"?<Text style={styles.headerTitleStyle}>Update Status</Text>:<Text style={styles.headerTitleStyle}>Edit Details</Text>} 
      </View>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}

        <Text style={styles.mainHeader}>
          Please provide below details to updated the application status to
          Sanctioned
        </Text>
        <Text style={styles.fieldHeader}>Bank RM</Text>
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
          name="bank_rm"
        />
        {errors.bank_rm && (
          <Text style={styles.error}>Bank RM is required</Text>
        )}

        <Text style={styles.fieldHeader}>Bank RM Phone number</Text>
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
          name="rm_phone"
        />
        {errors.rm_phone && (
          <Text style={styles.error}>RM Phone is required</Text>
        )}

        <Text style={styles.fieldHeader}>Bank RM Email ID</Text>
        <View style={styles.rowContainer}>
  <Controller
    control={control}
    rules={{ required: true }}
    render={({ field: { onChange, onBlur, value } }) => (
      <TextInput
        style={[styles.inputEmail]}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        // placeholder="Enter your Address"
      />
    )}
    name="rm_email_prefix"
  />

  <Controller
    control={control}
    rules={{ required: true }}
    render={({ field: { onChange, value } }) => (
      <>
      <View style={{width:"60%"}}>
        <TouchableOpacity
          onPress={() => openModal()}
          style={styles.selector}
        >
          <Text style={styles.selectorText} >{selectedEmail||value}</Text>
          <Entypo name="chevron-down" size={24} color="black" />
        </TouchableOpacity>
        
        </View>
      <Modal
          visible={emailModal}
          transparent
          animationType="slide"
          onRequestClose={() => closeModal()}
        >
          <View style={styles.modalContainer2}>
            <View style={styles.modalContent}>
              <FlatList
                data={application?.lending_partner?.email_domains}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => {
                      onChange(item); // Return selected email as value
                      handleSelect(item); // Set selected label
                      closeModal(); // Close modal after selection
                    }}
                  >
                    <Text style={styles.cityText}>{item}</Text>
                  </TouchableOpacity>
                )}
                style={{ width: "100%", margin: 10 }}
              />
            </View>
          </View>
        </Modal>
      </>
    )}
    name="rm_email"
  />
</View>

        {errors.rm_email && (
          <Text style={styles.error}>RM Email is required</Text>
        )}

        <Text style={styles.fieldHeader}>Loan Insurance Done?</Text>
        <Controller
          control={control}
          name="loan_insurance"
          render={({ field: { onChange, value } }) => (
            <View style={styles.radioGroup}>
              {["Yes", "No"].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioOption}
                  onPress={() =>
                    {
                      onChange(option)
                      setInsured(option=="Yes")
                    } }
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

        
        <View style={styles.row} >
        <Text style={styles.fieldHeader}>Sanctioned Amount</Text>
        {/* {sanctionValue&& */}
        <Text style={styles.fieldHeader}>{sanctionValue}</Text>
        {/* } */}
        </View>
        <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            maxLength={10}
            onChangeText={(text) => {
              setInputValue(text); // Update input value as user types
              const formattedText = formatAmount(text); // Format the input as user types
              setSanctionedValue(formattedText); // Update formatted value to display above input
              onChange(text);  // Pass raw value to react-hook-form
            }}
            value={value} // Display the raw input value
            keyboardType="numeric" // Only allow numeric input
          />
        )}
        name="sanctioned_amount"
      />
        {errors.sanctioned_amount && (
          <Text style={styles.error}>Sanctioned Amount is Required</Text>
        )}

      {insured&&  <View style={styles.row} >
        <Text style={styles.fieldHeader}>Insurance Amount</Text>
        {InsuranceValue&&<Text style={styles.fieldHeader}> {InsuranceValue}</Text>}
        </View>
      }

      {insured&&
        <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            maxLength={10}
            onChangeText={(text) => {
              setInputValue(text); // Update input value as user types
              const formattedText = formatAmount(text); // Format the input as user types
              setInsuranceValue(formattedText); // Update formatted value to display above input
              onChange(text);  // Pass raw value to react-hook-form
            }}
            value={value} // Display the raw input value
            keyboardType="numeric" // Only allow numeric input
          />
        )}
        name="insurance_amount"
      />
}
        {errors.insurance_amount && (
          <Text style={styles.error}>{errors.insurance_amount.message}</Text>
        )}
     
        <View style={styles.uploadContainer}>
          <View style={sanctionLetterUploadSelected && styles.uploadButtonContainer}>
            <View style={sanctionLetterUploadSelected && styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
                Upload Sanction Letter
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>
            <TouchableOpacity
              style={[
                !sanctionLetterUploadSelected && styles.uploadButton,
                sanctionLetterUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload()}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
            
            {/* <TouchableOpacity
              style={[
                !sanctionLetterUploadSelected && styles.uploadButton,
                sanctionLetterUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload()}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity> */}
          </View>
          <UploadButton
            modalVisible={modalVisible1}
            setModalVisible={setModalVisible1}
            setUrl={setSanctionLetterImage}
            title={"Sanction_Letter"}
            setIsSelected={setSanctionLetterUploadSelected}
          />
        </View>
         {
              document?.map((doc) => {
                if (doc) {
                  return (
                    // <View key={doc} style={styles.uploadContainerItems}>
                    //   <Pressable onPress={() =>handleClick(doc) }>
                    //   <Text style={styles.uploadOptionText}>Text</Text>
                    //   </Pressable>
                    // </View>
                    <Pressable  key={doc} onPress={()=> handleClick(doc)}>
                    <View style={styles.uploadedimageContainer}>
                      {doc && (
                        <>
                          <View
                            style={{
                              flex: 10,
                              flexDirection: "row",
                              justifyContent: "center",
                            }}
                          >
                            <Image
                              source={{ uri: doc }}
                              style={{ width: 50, height: 80 }}
                            />
                          </View>
                          <TouchableOpacity style={styles.imageWithCross} onPress={() => {console.log("clicked")}}>
                            <Entypo name="circle-with-cross" size={24} color="red" />
                          </TouchableOpacity>
                        </>
                      )}
                      {/* {(isPdf)&&(
                        <>
                          <View style={styles.imageBoundry} >
                            <PdfComponent />
                          </View>
                          
                          <TouchableOpacity style={styles.imageWithCross} onPress={() => {setisPdf(false),setIsSelected(false)}}>
                            <Entypo name="circle-with-cross" size={24} color="red" />
                          </TouchableOpacity>
                        </>
                      )} */}
                    </View>
                    </Pressable>
                  );
                }
                return null;
              })
             }

        <Text style={styles.fieldHeader}>Sanctioned Date</Text>
        <Controller
        control={control}
        name="sanction_date"
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
                onChange={(event, date) => {
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
      
        {errors.sanction_date && (
          <Text style={styles.error}>Sanctioned Date is required</Text>
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
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ebeff6",
    flex: 1,
    flexDirection: "column",
  },
  uploadButtonContainer: {
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
  headerTitleStyle: {
    fontSize: 20, // Adjust the font size
    fontWeight: 'light', // Make the text bold
    color: 'grey', // Change the text color // Center the text (might not work in all cases)
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  mainHeader: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
    color: "#666666",
  },
  uploadFieldHeader: {
    fontSize: 16,
    color: "#666666",
  },
  input: {
   
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,

    fontSize: 16,
  },
  inputEmail: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 15,
    fontSize: 16,
  },
  dateTimePicker:{
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
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
    marginTop: 15
  },

  selector: {
    borderColor:"#000",
   
    borderRadius: 15,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  
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
    // height: "50%",
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
    justifyContent: "flex-start",
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
  rowContainer: {
   padding:15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Ensure vertical alignment of items
    width: '100%', // Adjust as needed
    backgroundColor: '#fff', // Add background color for better visibility
    borderRadius: 15, // Add rounded corners 
  },
  flexInput: {
    flex: 2, // Adjust to control space occupied by input
    marginRight: 10, // Space between input and selector
  },
  flexSelector: {
    flex: 1, // Adjust to control space occupied by selector
  },
  equalWidth: {
    flex: 1, // Both will take up equal width of the container
  },
  row:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
   imageWithCross: {
    position: "absolute",
    top: 15, // Adjust top margin
    right: 5, // Adjust right margin
    zIndex: 10, // Ensure the cross is above the image
  },
  uploadedimageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop:15,
    
  },
});

export default Index;
