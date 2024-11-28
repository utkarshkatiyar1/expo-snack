import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/index";
import { Controller, useForm } from "react-hook-form";
import { resetApplicationEdit } from "@/store/applicationEdit";



interface FormData {
  status: string;
}
const defaultValues = {
  status: "",
};

export default function Details() {
  const employeeRole = useSelector((state: RootState) => state.util.role);
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });
  const { application, error } = useSelector(
    (state: RootState) => state.application
  );
  const options = ["At Bank", "Sanctioned", "Disbursed", "Mark as failed"];
  const [modalSuccess, setModalSuccess] = React.useState(false);

  const handleCancel = () => {
    setModalSuccess(false);
  };

  const makeCall = (item: any) => {
    let phoneNumber = item?.bank_rm_phone_number
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error("Error making call:", err)
      );
    }
  };

  const handleRoute = (data: FormData) => {
    if (data.status === "Sanctioned") {
      router.push({
        pathname: "../updateStatus",
        params: { purpose:"create",status: "Sanctioned" }});
    } else if (data.status === "Disbursed") {
      router.push("../updateStatus/disbursed");
    }
    setModalSuccess(false);
  };

  const openModel = () => {
    dispatch(resetApplicationEdit());
    setModalSuccess(true);
  };
  return (
    <View style={styles.main}>
      <ScrollView
        style={styles.viewBox}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.column}>
          <Text style={styles.header}>
            Full Name : {application?.lead?.name}
          </Text>
          <Text style={styles.header}>
            {application?.lead?.loan_type?.display_name}
            {"   *   "} {application?.display_amount}
          </Text>
        </View>

        <View style={styles.horizontalLine} />

          <View style={styles.row}>
            <Text style={styles.title}>{application?.lending_partner?.name}</Text>
            {/* <Text style={styles.header}>Preferred Bank</Text> */}
          </View>

          <View style={styles.row}>
            <Text style={styles.header}>Application Id: </Text>
            <Text style={styles.title}>{application?.bank_application_id}</Text>
          </View>

        {application?.display_status != "Application At Bank" ? <View>
          
          {application?.display_status!="Disbursed" && (<View style={styles.row}>
            <Text style={styles.header}>Loan Amount: </Text>
            <Text style={styles.title}>{application?.display_amount}</Text>
          </View>
        )}

          {application?.display_sanctioned_amount && (
            <View style={styles.row}>
              <Text style={styles.header}>Sanctioned: </Text>
              <Text style={styles.title}>{application?.display_sanctioned_amount}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.header}>Loan Insured: </Text>
            <Text style={styles.title}>{application?.loan_insurance_added === true ? `Yes of ${application?.display_loan_insurance_amount}` : "No"}</Text>
          </View>

          {application?.display_status==="Disbursed" && (
            <Text style={styles.header}>
            {application.disbursements.map((disbursement, index) => (
              <Text key={index}>
                LAN: {disbursement.loan_account_number}{"\n"}
              </Text>
            ))}</Text>
          )}

          {application?.display_status!="Disbursed" && (<View style={styles.row}>
            <Text style={styles.header}>Date: </Text>
            <Text style={styles.title}>{application?.display_sanctioned_date ? application?.display_sanctioned_date : "--"}</Text>
          </View>)}

          {application?.display_status!="Disbursed" && (<TouchableOpacity onPress={() => router.push({
            pathname: '../(toptabs)/documents',
            params: { applicationId: JSON.stringify(application?.id) },
          })}><Text style={{ color: "#2f63c3", fontSize: 15, fontWeight: 500 }}>View Letter</Text></TouchableOpacity>)}



          {/* <View style={styles.row}>
          <Text style={styles.title}>
            {application?.lead?.loan_type?.display_name}
          </Text>
          <Text style={styles.header}>Loan Type</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.title}>{application?.branch_name}</Text>
          <Text style={styles.header}>Branch Location</Text>
        </View>



        {application?.bank_rm_email_address && (
          <View style={styles.row}>
            <Text style={styles.title}>
              {application?.bank_rm_email_address}
            </Text>
            <Text style={styles.header}>Bank RM Email ID</Text>
          </View>
        )}

        */}
        <View style={styles.horizontalLine} />
{application?.display_status!="Disbursed" && (
          <View>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <View>
              {application?.bank_rm_name && (
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }}>
                  <Text style={styles.header}>Bank RM: </Text>
                  <Text style={styles.title}>{application?.bank_rm_name}</Text>
                </View>
              )}
              {application?.bank_rm_phone_number && (
                <Text style={styles.title}>{application?.bank_rm_phone_number}</Text>
              )}
            </View>
            <Text style={{ color: "#2f63c3", fontSize: 19, fontWeight: 500 }} onPress={() => makeCall(application)}>Call</Text>
            
          </View>
          <View style={styles.horizontalLine} />
          </View>

        )}


{application?.display_status==="Disbursed" && (
  <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1c4f7f' }}>Disbursements</Text>
        <Text style={{ fontSize: 14, color: '#555' }}>{application?.disbursements.length} added</Text>
      </View>
      <View
        style={{
          backgroundColor: '#2e5b8a',
          padding: 16,
          borderRadius: 10,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent:'space-between',
        }}
      >
        <View style={styles.column}>
        <Text style={{ fontSize: 24, color: '#fff', marginRight: 8 }}>{application?.commission_amount != 0 ? application?.display_commission_amount : "--"}</Text>
        <Text style={{ fontSize: 14, color: '#fff', flex: 1 }}>Commission earned</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 30,
          }}
          onPress={()=>router.push("../Lead/Disbursements")}
        >
          <Text style={{ fontSize: 14, color: '#2e5b8a', fontWeight: '600' }}>Add Disbursement</Text>
        </TouchableOpacity>
      </View>

      {application?.disbursements.map((disbursement, index) => ( 
        // <TouchableOpacity onPress={() => router.push({
        //   pathname: '../Lead/Disbursements/details',
        //   params: { applicationId: JSON.stringify(application?.id) },
        // })}>
        <TouchableOpacity
  key={index}
  onPress={() =>
    router.push({
      pathname: `../Lead/Disbursements/details`,
      params: { iddis:disbursement?.id },
    })
  }
>
       
      <View
      key={index} 
        style={{
          backgroundColor: '#f8f9fe',
          borderRadius: 35,
          padding: 16,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 4,
          borderWidth:1,
          borderColor: '#929294',
          marginBottom: 8
        }}
      >
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#333' }}>{disbursement.display_disbursement_amount}</Text>
          {/* <View
            style={{
              backgroundColor: '#e0ebf5',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: '#2e5b8a', fontWeight: '600' }}>PARTIAL</Text>
          </View> */}
        </View>
        <Text style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>{disbursement.display_disbursement_date}</Text>
        <View >
          <View style={styles.row}>
          {disbursement.otc_cleared===true &&
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>OTT</Text>
          <Text style={{ fontSize: 14, color: 'green', marginLeft: 4 }}>✔</Text>
          <Text style={{ fontSize: 14, color: '#888', marginHorizontal: 8 }}>•</Text>
          </View>}
          {disbursement.pdd_cleared===true &&
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#333' }}>PDD</Text>
          <Text style={{ fontSize: 14, color: 'green', marginLeft: 4 }}>✔</Text>
          </View>
}
          </View>
        </View>
        <Text style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>LAN: {disbursement.loan_account_number}</Text>
        {/* <View
          style={{
            backgroundColor: '#c6e7f1',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: '#2e5b8a', fontWeight: '600' }}>LOAN</Text>
        </View> */}
        <View style={styles.row2}>
        <Text style={{ fontSize: 16, color: 'green', fontWeight: '600', marginTop: 8 }}>{disbursement.display_status}</Text>
        <Text style={{ fontSize: 16, color: 'green', fontWeight: '600', marginTop: 8}}>{disbursement.display_commission_amount===null? "--" : disbursement.display_commission_amount }</Text>
        </View>

        <View style={styles.row2}>
        <Text style={{ fontSize: 14, color: '#888' }}>{disbursement.disbursement_date}</Text>
        <Text style={{ fontSize: 14, color: '#888', marginTop: 8 }}>Commission earned</Text>
        </View>
      </View>
      </TouchableOpacity>
      
    ))}
    </View>
    )}






         
        </View> : <View style={styles.horizontalLine} />}

        <View style={styles.column}>
          <Text style={styles.title}>{application?.lending_partner?.name}</Text>
          <Text style={styles.header}>Preferred Bank</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.logged_in_date}</Text>
          <Text style={styles.header}>Application Date</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.bank_application_id}</Text>
          <Text style={styles.header}>Application Id</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.display_amount}</Text>
          <Text style={styles.header}>Amount</Text>
        </View>

        {application?.display_sanctioned_amount && (
          <View style={styles.column}>
            <Text style={styles.title}>{application?.display_sanctioned_amount}</Text>
            <Text style={styles.header}>Sanctioned Amount</Text>
          </View>
        )}

        <View style={styles.column}>
          <Text style={styles.title}>
            {application?.lead?.loan_type?.display_name}
          </Text>
          <Text style={styles.header}>Loan Type</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.branch_name}</Text>
          <Text style={styles.header}>Branch Location</Text>
        </View>

        {application?.bank_rm_name && (
          <View style={styles.column}>
            <Text style={styles.title}>{application?.bank_rm_name}</Text>
            <Text style={styles.header}>Bank RM</Text>
          </View>
        )}

        {application?.bank_rm_email_address && (
          <View style={styles.column}>
            <Text style={styles.title}>
              {application?.bank_rm_email_address}
            </Text>
            <Text style={styles.header}>Bank RM Email ID</Text>
          </View>
        )}

        {application?.bank_rm_phone_number && (
          <View style={styles.column}>
            <Text style={styles.title}>
              {application?.bank_rm_phone_number}
            </Text>
            <Text style={styles.header}>Bank RM Phone number</Text>
          </View>
        )}

        <View style={styles.dashedLine} />

        <View style={styles.column}>
          <Text style={styles.title}>{application?.lead?.name}</Text>
          <Text style={styles.header}>Full Name</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.lead?.phone_number}</Text>
          <Text style={styles.header}>Contact Number</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.lead?.pan}</Text>
          <Text style={styles.header}>PAN Number</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{application?.lead?.display_employment_type}</Text>
          <Text style={styles.header}>Employment Type</Text>
        </View>

        <View style={{ marginTop: 25 }}>
          <Text style={styles.header}>Notes</Text>
          <Text style={styles.title}>{application?.lead?.notes}</Text>
        </View>


      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonCancel} onPress={openModel}>
          <Text style={styles.cancelButtonText}>Update Status</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        visible={modalSuccess}
        animationType="slide"
        onRequestClose={() => setModalSuccess(false)}
      >
        <View style={styles.modalUpdateBackground}>
          <View style={styles.modalUpdateContainer}>
            <View style={styles.topSection}>
              <Text style={styles.modalHeader}>Update Status</Text>

              {/* Controller for radio buttons */}
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                      const isDisabled =
                        (application?.status === "sent_to_bank" &&
                          item === "At Bank") ||
                        (application?.status === "sanctioned" &&
                          (item === "At Bank" || item === "Sanctioned")) ||
                        (application?.status === "disbursed" &&
                          (item === "At Bank" ||
                            item === "Sanctioned" ||
                            item === "Disbursed")); // Disable 'At Bank' option when value is 'send_to_bank'
                      const notVisible =
                        application?.status === "sent_to_bank"
                          ? "Disbursed"
                          : application?.status === "disbursed"
                            ? "Mark as failed"
                            : "";
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            if (!isDisabled) {
                              onChange(item); // Update field value when an option is selected, unless disabled
                            }
                          }}
                          style={[
                            styles.optionContainer,
                            isDisabled ? styles.disabledOption : {}, // Apply disabled style if needed
                          ]}
                          disabled={isDisabled} // This will prevent the button from being pressed if disabled
                        >
                          <Text
                            style={
                              item === "Mark as failed"
                                ? styles.textItemFailed
                                : styles.textItem
                            }
                          >
                            {item}
                          </Text>
                          {notVisible !== item && (
                            <View
                              style={[
                                styles.radioButton,
                                isDisabled ? styles.disabledOuterCircle : {},
                              ]}
                            >
                              {value === item && (
                                <View style={styles.radioButtonSelected} />
                              )}
                              {isDisabled && (
                                <View style={styles.disabledInnerCircle} />
                              )}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonNext}
                onPress={handleSubmit(handleRoute)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* <LoadingOverlay loading={loading} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    // backgroundColor: "#F4F6FF",
    backgroundColor: "#ffffff",
    flex: 1,
  },
  viewBox: {
    padding: 20,
    marginHorizontal: 5,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "medium",
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
    justifyContent: "space-between",
    width: "100%",
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
    borderRadius: 15,
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
  modalUpdateBackground: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalUpdateContainer: {
    width: "100%",
    height: "50%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  textItem: {
    fontSize: 18,
    fontWeight: "400",
    color: "black",
  },
  textItemFailed: {
    fontSize: 18,
    fontWeight: "400",
    color: "red",
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "500",
    paddingBottom: 15,
    color: "#000",
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
  horizontalLine: {
    borderBottomColor: "#ccc", // or any color you prefer
    borderBottomWidth: 1,
    marginVertical: 10, // adjust for spacing above/below the line
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: 20,
    // Adjust this padding as needed
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
    borderTopWidth: 1,
    paddingTop: 10,
    borderColor: "#ddd",
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 7,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
  },
  disabledOption: {
    opacity: 0.5, // Change the opacity to make the disabled option look grayed out
  },
  disabledOuterCircle: {
    borderColor: "grey", // Changes outer circle color to gray when disabled
    borderWidth: 2, // Ensure the border is visible
  },
  disabledInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "grey", // Changes inner circle color to gray when disabled
  },
  column: {
    display: "flex",
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // marginHorizontal: 2,
    // marginVertical: 4,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  row2: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between"
  },
  dashedLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: 5
  },
});
