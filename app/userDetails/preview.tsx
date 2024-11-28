import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  basicDeatilas,
  billingCompanies,
  BillingCompanyParams,
} from "@/api/dsaOnboard";
import { XMLParser } from "fast-xml-parser";
import { getPresignedUrl, uploadToS3 } from "@/api/uploaddoc";
import { useToast } from "react-native-toast-notifications";
import { set } from "react-hook-form";
import { setViewUrl } from "@/store/profile";

const LoadingOverlay = ({ loading }: { loading: boolean }) => (
  <Modal transparent={true} visible={loading}>
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  </Modal>
);

const PreviewPage = () => {
  const router = useRouter();
  const toaster = useToast();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalSuccess, setModalSuccess] = useState<boolean>(false);
  const [docUrl, setDocUrl] = useState<string|null>("");
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const billingData = useSelector(
    (state: RootState) => state.formdata.billingData
  );
  const basicData = useSelector((state: RootState) => state.formdata.basicData);
  const billingDataFull = billingData as BillingCompanyParams;


  const openImageViewer = (type: string) => {
     if (type === "sign" && billingData?.signature) {
       dispatch(setViewUrl(billingData?.signature));
        setDocUrl(billingData?.signature ?billingData?.signature:null);
  } else if (type === "cheque" && billingData?.bank_account?.cancelled_cheque) {
       dispatch(setViewUrl(billingData?.bank_account?.cancelled_cheque));
    setDocUrl(billingData?.bank_account?.cancelled_cheque ?billingData?.bank_account?.cancelled_cheque:null);
  } else if (type === "gst" && billingData?.gst_doc) {
        dispatch(setViewUrl(billingData?.gst_doc));
    setDocUrl(billingData?.gst_doc ?billingData?.gst_doc:null);
  } else if (type === "pan" && billingData?.pan_doc) {  
        dispatch(setViewUrl(billingData?.pan_doc));
    setDocUrl(billingData?.pan_doc ?billingData?.pan_doc:null);
  }
    router.push({
      pathname: "../userDetails/ImageViewer",
      params: {
        doc: docUrl as string,
      },
    });
  };

  const processData = async () => {
    try {
      // Step 1: Ensure basicData exists
      setLoading(true);
      if (!basicData) {
        console.error("basicData is null");
        return; // Stop execution if basicData is missing
      }

      const basic_details=await basicDeatilas(basicData, toaster);
      console.log(basic_details,"basic_details");
      const documents = [
        {
          field: "signature",
          name: "signature",
          uri: billingDataFull?.signature,
        },
        { field: "gst_doc", name: "gst", uri: billingDataFull?.gst_doc },
        { field: "pan_doc", name: "pan", uri: billingDataFull?.pan_doc },
        {
          field: "cancelled_cheque",
          name: "cancelled_cheque",
          uri: billingDataFull?.bank_account?.cancelled_cheque,
        },
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

      // Step 5: Prepare the request body for billingCompanies API
      const requestBody: BillingCompanyParams = {
        ...billingDataFull,
        gst_doc: keys.gst_doc,
        pan_doc: keys.pan_doc,
        signature: keys.signature,
        bank_account: {
          ...billingDataFull.bank_account,
          cancelled_cheque: keys.cancelled_cheque,
        },
      };

      // Step 6: Run billingCompanies API after all previous steps are complete
      if (billingDataFull) {
       
        const response = await billingCompanies(requestBody, toaster);
        console.log("billingCompanies request body:", requestBody);
        console.log("billingCompanies resonse body:", response);
       
        setLoading(false);
        setModalSuccess(true);
      }
    } catch (error) {
      toaster.show("some error has occured", { type: "error" });
    }
  };

  // Call the async functionuse

  const handleSubmit = () => {
    processData();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleClick = () => {
    router.push("/");
    setModalSuccess(false);
  };

  return (
    <View style={styles.main}>
      <ScrollView style={styles.viewBox}>
        {/* Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{basicData?.name}</Text>
          <Text style={styles.header}>Full Name</Text>
        </View>

        {/* City */}
        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.city.find((item: any) => {
                return item.id === basicData?.city_id;
              })?.name
            }
          </Text>
          <Text style={styles.header}>City</Text>
        </View>

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{basicData?.email}</Text>
          <Text style={styles.header}>Email Address</Text>
        </View>

        {/* Organization Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{basicData?.org_name}</Text>
          <Text style={styles.header}>Organization Name</Text>
        </View>

        {/* Organization Address */}
        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{basicData?.org_address}</Text>
          <Text style={styles.header}>Organization Address</Text>
        </View>

        {/* <View style={styles.dottedLine} /> */}
        <View style={styles.dottedLineContainer}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View key={index} style={styles.dot} />
          ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.name}</Text>
          <Text style={styles.header}>Company Name</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.address}</Text>
          <Text style={styles.header}>Billing Address</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.city.find((item: any) => {
                return item.id === billingData?.bill_to_city_id;
              })?.name
            }
          </Text>
          <Text style={styles.header}>Billing City</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.list_place_of_supply.find((item: any) => {
                return item.gst_code === billingData?.place_of_supply_id;
              })?.name
            }
          </Text>
          <Text style={styles.header}>Place of Supply</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.company_types.find((item: any) => {
                return item.name === billingData?.company_type;
              })?.display_name
            }
          </Text>
          <Text style={styles.header}>Company Type</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.email}</Text>
          <Text style={styles.header}>Email Address</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.gstin}</Text>
          <Text style={styles.header}>GST Number</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.pan}</Text>
          <Text style={styles.header}>PAN Number</Text>
        </View>

        <View style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => openImageViewer("gst")}>
            <Text style={styles.titleLink}>View</Text>
          </TouchableOpacity>
          <Text style={styles.header}>GST</Text>
        </View>

        <View style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => openImageViewer("pan")}>
            <Text style={styles.titleLink}>View</Text>
          </TouchableOpacity>
          <Text style={styles.header}>PAN</Text>
        </View>

        <View style={styles.dottedLineContainer}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View key={index} style={styles.dot} />
          ))}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.bank_account?.name}</Text>
          <Text style={styles.header}>Account Holder Name</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>{billingData?.bank_account?.ifsc}</Text>
          <Text style={styles.header}>Bank IFSC</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.banks.find((item: any) => {
                return item.id === billingData?.bank_account?.bank_id;
              })?.name
            }
          </Text>
          <Text style={styles.header}>Bank Name</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {
              metaData?.bank_account_types.find((item: any) => {
                return item.name === billingData?.bank_account?.account_type;
              })?.display_name
            }
          </Text>
          <Text style={styles.header}>Account Type</Text>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.title}>
            {billingData?.bank_account?.account_number}
          </Text>
          <Text style={styles.header}>Account Number</Text>
        </View>

        <View style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => openImageViewer("cheque")}>
            <Text style={styles.titleLink}>View</Text>
          </TouchableOpacity>
          <Text style={styles.header}>cancelled Cheque</Text>
        </View>

        <View style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => openImageViewer("sign")}>
            <Text style={styles.titleLink}>View</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Signature</Text>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonNext} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        visible={modalSuccess}
        animationType="slide"
        onRequestClose={() => setModalSuccess(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.topSection}>
              <Text style={styles.modalHeader}>
                Profile details submitted successFully
              </Text>
              <Text style={styles.modalSubheader}>
                We have received your details and are being verified. This
                process usually takes two buisness days. We will notify you once
                your profile has been approved.{" "}
              </Text>
            </View>
            <TouchableOpacity style={styles.buttonNext} onPress={handleClick}>
              <Text style={styles.homebuttonText}>Go to Homepage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoadingOverlay loading={loading} />
    </View>
  );
};

export default PreviewPage;

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#F4F6FF",
    flex: 1,
  },
  viewBox: {
    padding: 10,
    marginHorizontal: 5,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20, // Space between fields
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
  },
  header: {
    color: "#808080",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  homebuttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 17,
  },
  dot: {
    width: 10, // Length of each dot
    height: 2, // Height of each dot (to make it more circular)
    backgroundColor: "#808080", // Same color as header
    borderRadius: 4, // Make it circular
    marginHorizontal: 2, // Space between each dot
  },
  dottedLineContainer: {
    flexDirection: "row", // Arrange dots horizontally
    justifyContent: "flex-start", // Align dots to start
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden", // Prevent overflow
  },
  topSection: {
    flex: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  titleLink: {
    fontSize: 17,
    fontWeight: "500",
    color: "#007BFF",
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
    borderRadius: 10,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  cancelButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 23,
    fontWeight: "400",
    marginBottom: 10,
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  modalSubheader: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 10,
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#808080",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
