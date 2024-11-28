import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Disbursement } from "@/store/applicationSlice";
import { useDispatch, useSelector } from "react-redux";
import { Application } from "@/utils/type";
import { RootState } from "@/store/index";
import { getFileUrl, getPresignedUrl, uploadToS3 } from "@/api/uploaddoc";
import { XMLParser } from "fast-xml-parser";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Controller, set, useForm } from "react-hook-form";
import { TextInput } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Entypo from "@expo/vector-icons/Entypo";
import UploadButton from "@/components/uploadButton";
import { DisbursementDetailsParams, DisbursementUpdateParams, editDisbusrement, updateToDisbursed } from "@/api/lead";
import { useToast } from "react-native-toast-notifications";
import { setViewUrl } from "@/store/profile";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const updateDetails = () => {

  const [expanded, setExpanded] = useState(false);
  const [disbursement, setDisbursement] = useState<Disbursement>()
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [disbusementUploadSelected, setDisbursementUploadSelected] = useState<boolean>(false);
  const [bankerUploadSelected, setBankerUploadSelected] = useState<boolean>(false);
  const [bankerConfirmationImage, setbankerConfirmationImage] = useState<string | null>(null);
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [modalVisible2, setModalVisible2] = useState<boolean>(false);
  const [disbursementImage, setDisbursementImage] = useState<string | null>(null);
  const [disbursementLetterDocuments, setDisbursementLetterDocuments] = useState<string[]>([]);
  const [bankerConfirmationDocuments, setBankerConfirmationDocuments] = useState<string[]>([]);
  const [objectsArray1, setObjectsArray1] = useState<any>();
  const [objectsArray2, setObjectsArray2] = useState<any>();

  const router = useRouter();
  const dispatch = useDispatch();
  const toaster = useToast();

  const { application, error } = useSelector(
    (state: RootState) => state.application
  );

  interface FormData {
    disbursal_type: string|any;
    disbursement_amount: string|any;
    payout_on: string|any;
    date_of_disbursement: string|any;
    lan_number: string|any;
    otc_cleared: string|any;
    pdd_cleared: string|any;
    category: string|any;
    branch_code: string|any;
  }

  const defaultValues : FormData = {
    disbursal_type: disbursement?.display_disbursement_type,
    disbursement_amount: disbursement?.disbursement_amount,
    payout_on: disbursement?.commission_on,
    date_of_disbursement: disbursement?.disbursement_date,
    lan_number: disbursement?.loan_account_number,
    otc_cleared: disbursement?.otc_cleared,
    pdd_cleared: disbursement?.pdd_cleared,
    category: disbursement?.category,
    branch_code: disbursement?.branch_code,
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleUpload = async (title: string) => {
    if (title === "disbursement") {
      setModalVisible1(true);
      setDisbursementUploadSelected(true);
    } else {
      setModalVisible2(true);
      setBankerUploadSelected(true);
    }
  };
  // const openModal = () => {
  //     setDateModal(true);
  // };
  // const closeModal = () => {
  //     setDateModal(false);
  // };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>(
    {
      defaultValues,
    }
  );

  const handlePress = () => {
    router.back();
  }

  const handleCancel = () => {
    router.back();
  };

  useEffect(() => {
    
    if(application?.disbursements){
      setDisbursementUploadSelected(true);
      setBankerUploadSelected(true);
    }
      
    setDisbursement(application?.disbursements?.find(item => item.id == Number(iddis)))
     setValue("disbursal_type", disbursement?.commission_on==="disbursal_amount" ? "Full" : "Partial");
      setValue("disbursement_amount", disbursement?.disbursement_amount.toString());
      setValue("payout_on", disbursement?.commission_on==="disbursal_amount" ? "Disbursed Amount" : "Sanctioned Amount");
      setValue("date_of_disbursement", disbursement?.disbursement_date.toString());
      setValue("lan_number", disbursement?.loan_account_number.toString());
      setValue("branch_code", disbursement?.branch_code?.toString())
      setValue("otc_cleared", disbursement?.otc_cleared ? "Yes" : "No");
      setValue("pdd_cleared", disbursement?.pdd_cleared ? "Full" : "Partial");
      setValue("category", disbursement?.category ==="loan" ? "Loan" : "Rinn Raksha");


      const disbursementLetterDocumentsUrl = disbursement?.documents?.filter(doc => doc.type === "disbursement_letter").map(doc => doc.url).filter((url): url is string => url !== null) || [];
      const bankerConfirmationDocumentsUrl = disbursement?.documents?.filter(doc => doc.type === "bankers_confirmation").map(doc => doc.url).filter((url): url is string => url !== null) || [];

      const disbursementLetterObjectArray = disbursementLetterDocumentsUrl.map((key)=>({
        field: "disbursement_letter",
        name: "disbursement_letter", 
        uri: key,
      }))

      setObjectsArray1(disbursementLetterObjectArray)

      const confirmationLetterObjectArray = bankerConfirmationDocumentsUrl.map((key)=>({
        field: "banker's_Confirmation_letter",
        name: "banker_confirmation_letter", 
        uri: key,
      }))

      setObjectsArray2(confirmationLetterObjectArray)
 
      Promise.all(
        disbursementLetterDocumentsUrl.map((key) => {
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
         setDisbursementLetterDocuments(validUrls as string[]);
        console.log("disbursementLetterDocuments", validUrls);
      });


      Promise.all(
        bankerConfirmationDocumentsUrl.map((key) => {
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
         setBankerConfirmationDocuments(validUrls as string[]);
        console.log("bankerConfirmationDocuments", validUrls);
      });
      
      
  }, [application,disbursement]);

  console.log("disbursementxyz", disbursement);

  console.log("disbursementLetterDocuments", disbursementLetterDocuments);
  console.log("bankerConfirmationDocuments", bankerConfirmationDocuments);

  const onSubmit = async (data: FormData) => {
 

    console.log("upadte Disbursemtn data", data);
    const documents = [
      disbursementImage ? { field: "disbursement_letter", name: "disbursement_letter", uri: disbursementImage } : objectsArray1,
      bankerConfirmationImage ? { field: "banker's_Confirmation_letter", name: "banker_confirmation_letter", uri: bankerConfirmationImage } : objectsArray2
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


    // const requestBody: DisbursementDetailsParams = {
    //     commission_on: "disbursal_amount",
    //     disbursement_amount : parseFloat(data.disbursement_amount),
    //     disbursement_date: "2024-11-11",
    //     disbursement_type: "full",
    //     documents: [
    //       { localDoc:true,
    //         type: "disbursement_letter",
    //         url: keys["disbursement_letter"]
    //       },
    //        { localDoc:true,
    //          type: "bankers_confirmation",
    //          url: keys["banker's_Confirmation_letter"]
    //       }
    //     ],
    //     loan_account_number: data.lan_number,
    //     otc_cleared: data.otc_cleared==="Yes",
    //     pdd_cleared: data.pdd_cleared === "Full",
    // };
   
    const requestBody: DisbursementUpdateParams= {
     
      commission_on: data.payout_on==="Disbursed Amount" ? "disbursal_amount" : "sanctioned_amount",
      branch_code: data.branch_code?data.branch_code:null,
      category: data.category.toLowerCase(), 
      disbursement_amount: parseFloat(data.disbursement_amount),
      disbursement_date: data.date_of_disbursement,
      disbursement_type: data.disbursal_type.toLowerCase()==="Full" ? "full" : "partial",

      documents: [
          { localDoc: true, type: "disbursement_letter", url: keys["disbursement_letter"] },
          { localDoc: true, type: "bankers_confirmation", url: keys["banker's_Confirmation_letter"] }
      ],
      has_additional_payout: false,
      loan_account_number: data.lan_number,
      otc_cleared: data.otc_cleared === "Yes",
      pdd_cleared: data.pdd_cleared === "Full"
  };

  console.log("requestBody", requestBody);  
  


    if (disbursement && disbursement.id) {
      
      console.log("application.id", disbursement.id);
      const response = await editDisbusrement(disbursement?.id.toString(), requestBody);
      console.log("response", response);
    } else {
      console.error("Application is null or does not have an id");
    }
    // // router.push("../updateStatus/disbursed");
    router.replace({
      pathname: '../../(toptabs)',
      params: { applicationId: JSON.stringify(application?.id) },
    });
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
  const { iddis } = useLocalSearchParams();
  return (
    <View style={styles.outerContainer}>
      {/* Scrollable content below */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={[styles.card, styles.shadow]}>
          <View style={styles.row}>
            <View>
              <Text style={styles.header}>
                {application?.lead?.name}
              </Text>
              <Text style={styles.header}>
                {application?.lead?.loan_type?.display_name}
                {"   *   "} {application?.display_amount}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleExpand}>
              <Ionicons
                name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={24}
                color="blue"
              />
            </TouchableOpacity>
          </View>
          {/* Collapsible Content */}
          {expanded && (
            <View style={styles.details}>
              <View style={styles.column}>
                <Text style={styles.partnerName}>{application?.lending_partner.name}</Text>
                <Text style={styles.applicationId}>Application ID: {application?.bank_application_id}</Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <View style={styles.column}>
                <Text style={{}}>Sanctioned: {application?.display_sanctioned_amount}</Text>
                <Text style={{}}>Loan Insured: {application?.loan_insurance_added === true ? `Yes of ${application?.display_loan_insurance_amount}` : "No"}
                </Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <View style={styles.column}>
                <Text style={{}}>
                  {application?.disbursements.map((disbursement, index) => (
                    <Text key={index}>
                      LAN: {disbursement.loan_account_number}{"\n"}
                    </Text>
                  ))}</Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <TouchableOpacity onPress={() => handlePress()}>
                <View style={styles.column}>
                  <Text style={{ color: "#336ba1", fontSize: 14, fontWeight: 500 }}>View application details</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {disbursement?.status === "changes_requested" &&
          <View style={styles.alert}>
            <View><AntDesign name="exclamationcircleo" size={18} color="#F9A825" style={styles.icon} /></View>
            <View><Text style={styles.noteschanges}>{disbursement?.notes}</Text></View>
          </View>}

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



<Text style={styles.fieldHeader}>Amount Disbursed </Text>
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
    render={({ field: { onChange ,onBlur,value} }) => (
        <View style={styles.dateTimePicker}>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              // placeholder="Enter your Pincode"
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Entypo name="chevron-down" size={24} color="black" />
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowPicker(false);
                        if (date) {
                            setSelectedDate(date);
                            onChange(date.toISOString().split('T')[0]);
                        }
                    }}
                />
            )}
        </View>
    )}
/>

      
        {errors.date_of_disbursement && (
          <Text style={styles.error}>Sanctioned Date is required</Text>
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
        {/* {errors.lan_number && (
          <Text style={styles.error}>{errors.lan_number.message}</Text>
        )} */}
 {
  application?.lending_partner.slug==="sbi" &&
  <>
    <Text style={styles.fieldHeader}>Branch Code</Text>
        <Controller
          control={control}
          rules={{ required: false }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange} // Convert text to uppercase
              value={value} // Display value in uppercase
              // placeholder="Enter your PAN number"
           
            />
          )}
          name="branch_code"
        />

  </>
 }
        
 
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
          <View style={disbusementUploadSelected && styles.uploadBoxContainer}>
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
        {
              disbursementLetterDocuments?.map((doc) => {
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


        <View style={styles.uploadContainer}>
          <View style={bankerUploadSelected && styles.uploadBoxContainer}>
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

        {
              bankerConfirmationDocuments?.map((doc) => {
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


      </ScrollView>

      
      <View style={styles.stickyContainer}>
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
    </View>
  )
}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  uploadBoxContainer: {
    flexDirection:"row",
    flex: 1,
    backgroundColor: '#f8f9fe',
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

  stickyContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 10
  },
  imageWithCross: {
    position: "absolute",
    top: 15, // Adjust top margin
    right: 5, // Adjust right margin
    zIndex: 10, // Ensure the cross is above the image
  },
  card: {
    borderWidth: 1,
    borderColor: '#ADD2E5',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#fff',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  partnerName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  applicationId: {
    // fontSize: 12,
    color: '#777',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  noteschanges: {
    fontSize: 15,
    fontWeight: 'medium',
    marginBottom: 5,
    color: "orange"
  },
  subTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  details: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  loanText: {
    fontSize: 14,
    color: 'blue',
    fontWeight: 'bold',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  column: {
    display: "flex",
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  extraText: {
    fontSize: 16,
    marginBottom: 10,
  },
  header: {
    color: "#808080",
    marginBottom: 5,
  },
  dashedLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 15,
    marginBottom: 0
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#64b86d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 17,
    paddingVertical: 11,
    paddingHorizontal: 1,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E5',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  icon: {
    marginRight: 8,
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
    justifyContent: "center",
  },
  // title: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   textAlign: "left", // Aligns text to the left
  //   alignSelf: "flex-start", // Ensures the text takes up space only as much as it needs
  // },
  // buttonText: {
  //   color: "white",
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
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
    flexDirection: "column",
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
export default updateDetails;