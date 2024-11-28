import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useForm, Controller, set } from "react-hook-form";
import { Picker } from "@react-native-picker/picker"; // Correct import for Picker
import { useLocalSearchParams, useRouter } from "expo-router";
import UploadButton from "@/components/uploadButton";
import {
  billingCompanies,
  BillingCompanyParams,
  BankAccount,
} from "@/api/dsaOnboard";
import { AccountType, Banks } from "@/constants/Constant";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setBillingData } from "@/store/formSlice";
import { useToast } from "react-native-toast-notifications";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import Colors from "@/constants/Colors";

interface FormData {
  account_holder_name: string;
  bank_ifsc: string;
  bank_name: number;
  account_type: string;
  account_number: string;
}

const ThirdForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();
  const metaData = useSelector((state: RootState) => state.metadata.metaData);
  const dispatch = useDispatch();
  const toaster = useToast();
  const params = useLocalSearchParams();
  const [signImg, setSign] = useState<string | null>(null);
  const [cancelledChequeImg, setCancelledCheque] = useState<string | null>(
    null
  );
  const [modalVisible1, setModalVisible1] = useState<boolean>(false);
  const [modalVisible2, setModalVisible2] = useState<boolean>(false);
  const router = useRouter();
  // Submit handler for both buttons
  const [bankModal, setBankModel] = useState(false);
  const [accountModal, setAccountModel] = useState(false);
  const [selectBank, setSelectBank] = useState<string | null>(null);
  const [selectAcountType, setAccountType] = useState<string | null>(null);
  const [chequeUploadSelected, setchequeUploadSelected] = useState(false); // State to track selection
  const [signUploadSelected, setSignUploadSelected] = useState(false); // State to track selection

  const handleUpload = (key: string) => {
    // Simulate file selection
    if (key === "sign") {
      setModalVisible1(true);
      setSignUploadSelected(true);
    } else {
      setModalVisible2(true);
      setchequeUploadSelected(true);
    }
  };

  const openModal = (data: string) => {
    if (data === "bank") {
      setBankModel(true);
    } else {
      setAccountModel(true);
    }
  };
  const closeModal = (data: string) => {
    if (data === "bank") {
      setBankModel(false);
    } else {
      setAccountModel(false);
    }
  };

  const handleSelect = (keyData: string, key: string) => {
    if (key === "bank") {
      setSelectBank(keyData);
      closeModal("bank");
    } else {
      setAccountType(keyData);
      closeModal("account");
    }
  };

  const onSubmit = (data: FormData) => {
    const bank_account: BankAccount = {
      account_number: data.account_number,
      account_type: data.account_type,
      bank_id: data.bank_name,
      cancelled_cheque: cancelledChequeImg as string,
      ifsc: data.bank_ifsc,
      name: data.account_holder_name,
    };
    const requestBody: BillingCompanyParams = {
      address: params.billing_address as string,
      bill_to_city_id: Number(params.billing_city),
      bill_to_pincode: params.billing_pincode as string,
      company_type: params.company_type as string,
      email: params.email as string,
      gst_doc: params.gstImage as string,
      gstin: params.gst_number as string,
      name: params.name as string,
      pan: params.pan_number as string,
      pan_doc: params.panImage as string,
      place_of_supply_id: params.place_of_supply as string,
      signature: signImg as string,
      bank_account: bank_account,
    };
    if (!requestBody.signature && !requestBody.bank_account.cancelled_cheque) {
      toaster.show("Please upload all documents!", {
        type: "error",
      });
      return;
    } else if (!requestBody.signature) {
      toaster.show("Please upload Signature!", {
        type: "error",
      });
      return;
    } else if (!requestBody.bank_account.cancelled_cheque) {
      toaster.show("Please upload Cancelled cheque!", {
        type: "error",
      });
      return;
    }
    router.push("../userDetails/preview");
    dispatch(
      setBillingData({
        signature: signImg as string,
        bank_account: bank_account,
      })
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Name Field */}
        <Text style={styles.fieldHeader}> Account Holder Name</Text>
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
          name="account_holder_name"
        />
        {errors.account_holder_name && (
          <Text style={styles.error}>Name is required</Text>
        )}

        <Text style={styles.fieldHeader}>Bank IFSC</Text>
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
              autoCapitalize="characters"
            />
          )}
          name="bank_ifsc"
        />
        {errors.bank_ifsc && (
          <Text style={styles.error}>Bank IFSC is required</Text>
        )}

        <Text style={styles.fieldHeader}>Bank Name</Text>
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
                <Text style={styles.selectorText}>{selectBank}</Text>
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
                      data={metaData?.banks}
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
          name="bank_name"
        />
        {errors.bank_name && (
          <Text style={styles.error}>Bank Name is required</Text>
        )}

        <Text style={styles.fieldHeader}>Account Type</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <View>
              {/* Trigger to open modal */}
              <TouchableOpacity
                onPress={() => openModal("account")}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>{selectAcountType}</Text>
                <Entypo name="chevron-down" size={24} color="black" />
              </TouchableOpacity>

              {/* Modal for city selection */}
              <Modal
                visible={accountModal}
                transparent
                animationType="slide"
                onRequestClose={() => closeModal("account")}
              >
                <View style={styles.modalContainer2}>
                  <View style={styles.modalContent}>
                    <FlatList
                      data={metaData?.bank_account_types}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.cityItem}
                          onPress={() => {
                            onChange(item.name); // Return city index as value
                            handleSelect(item.display_name, "account"); // Set city label
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
          name="account_type"
        />
        {errors.account_type && (
          <Text style={styles.error}>City is required</Text>
        )}

        <Text style={styles.fieldHeader}>Account Number</Text>
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
              keyboardType="numeric"
            />
          )}
          name="account_number"
        />
        {errors.account_number && (
          <Text style={styles.error}>Account Number is required</Text>
        )}

        <View style={styles.uploadContainer}>
          <View style={signUploadSelected && styles.container}>
            <View style={signUploadSelected && styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>Upload Signature</Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                !signUploadSelected && styles.uploadButton,
                signUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload("sign")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible1}
            setModalVisible={setModalVisible1}
            setUrl={setSign}
            title={"signature"}
            setIsSelected={setSignUploadSelected}
          />
        </View>

        <View style={styles.uploadContainer}>
          <View style={chequeUploadSelected && styles.container}>
            <View style={chequeUploadSelected && styles.textContainer}>
              <Text style={styles.uploadFieldHeader}>
                Upload Cancelled cheque
              </Text>
              <Text style={styles.fieldSubHeader}>upload up to 10 MB</Text>
            </View>

            <TouchableOpacity
              style={[
                !chequeUploadSelected && styles.uploadButton,
                chequeUploadSelected && styles.uploadButtonSelected, // Apply different style if selected
              ]}
              onPress={() => handleUpload("cheque")}
            >
              <AntDesign name="clouduploado" size={24} color="#007AFF" />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <UploadButton
            modalVisible={modalVisible2}
            setModalVisible={setModalVisible2}
            setUrl={setCancelledCheque}
            setIsSelected={setchequeUploadSelected}
            title={"cancelled_Cheque"}
          />
        </View>
      </ScrollView>

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
    flexDirection: "row",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    // Add padding to prevent content from hiding behind buttons
  },
  fieldSubHeader: {
    fontSize: 14,
    color: "#808080",
    marginBottom: 5,
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
  textContainer: {
    flex: 1, // Ensure text takes up available space
  },
  uploadButtonSelected: {
    alignSelf: "flex-end", // Move to the right when selected
    backgroundColor: "#ebeff6", // Change background color
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ThirdForm;
