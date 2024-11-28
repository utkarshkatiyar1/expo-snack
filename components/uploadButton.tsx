import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { getPresignedUrl, uploadToS3 } from "@/api/uploaddoc";
import PdfComponent from "@/assets/svg/pdf";
import { useToast } from "react-native-toast-notifications";
import Entypo from "@expo/vector-icons/Entypo";
import { useDispatch } from "react-redux";
import { setViewUrl } from "@/store/profile";
import { useRouter } from "expo-router";

const UploadButton = (props: any) => {
  const toaster = useToast();
  const router = useRouter();
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, setUrl, title,setIsSelected } = props;
  const [image, setImage] = useState<string | null>(null);
  const [isPdf, setisPdf] = useState<boolean>(false);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || galleryStatus !== "granted") {
        alert(
          "Sorry, we need camera and gallery permissions to make this work!"
        );
      }
    }
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


  const pickImageFromCamera = async () => {
    try {
      await requestPermissions();
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled) {
        toaster.show("Gallery action canceled", {
          type: "error",
        });
        return;
      }
      isPdf && setisPdf(false);
      setImage(result.assets[0].uri);
      setUrl(result.assets[0].uri);
      setModalVisible(false);
    } catch (error) {
      toaster.show("An error occurred", {
        type: "error",
      });
    } finally {
      setModalVisible(false);
    }
  };

  // Open gallery to pick image
  const pickImageFromGallery = async () => {
    try {
      await requestPermissions();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        toaster.show("Camera action canceled", {
          type: "error",
        });
        return;
      }
      isPdf && setisPdf(false);
      setImage(result.assets[0].uri);
      setUrl(result.assets[0].uri);
      setModalVisible(false);
    } catch (error) {
      toaster.show("An error occurred", {
        type: "error",
      });
    } finally {
      setModalVisible(false);
    }
  };

  // Pick a file from file manager
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Restrict to PDF files only
        copyToCacheDirectory: true, // Optional: Ensures file is available in cache
        multiple: false, // Optional: Disable multi-selection
      });
      if (result.canceled) {
        toaster.show("file upload canceled", {
          type: "error",
        });
        return;
      }
      setisPdf(true);
      setImage(null);
      setUrl(result.assets[0].uri);
      setModalVisible(false);
    } catch (error) {
      toaster.show("An error occurred", {
        type: "error",
      });
    } finally {
      setModalVisible(false);
    }
  };
  return (
    <>
      {(image||isPdf) && (
        <Pressable  onPress={()=> handleClick(image)}>
        <View style={styles.uploadedimageContainer}>
          {image && (
            <>
              <View
                style={{
                  flex: 10,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: 50, height: 80 }}
                />
              </View>
              <TouchableOpacity style={styles.imageWithCross} onPress={() => {setImage(null),setIsSelected(false)}}>
                <Entypo name="circle-with-cross" size={24} color="red" />
              </TouchableOpacity>
            </>
          )}
          {(isPdf)&&(
            <>
              <View style={styles.imageBoundry} >
                <PdfComponent />
              </View>
              
              <TouchableOpacity style={styles.imageWithCross} onPress={() => {setisPdf(false),setIsSelected(false)}}>
                <Entypo name="circle-with-cross" size={24} color="red" />
              </TouchableOpacity>
            </>
          )}
        </View>
        </Pressable>
      )}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Upload</Text>
            <TouchableOpacity
              onPress={pickImageFromCamera}
              style={styles.optionButton}
            >
              <View style={styles.option}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={45}
                  color="skyblue"
                />
                <Text style={styles.uploadOptionText}>
                  Click a picture via camera{" "}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={pickImageFromGallery}
              style={styles.optionButton}
            >
              <View style={styles.option}>
                <Ionicons name="image-sharp" size={45} color="#8db600" />
                <Text style={styles.uploadOptionText}>Upload from Gallery</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={pickDocument}
              style={styles.optionButton}
            >
              <View style={styles.option}>
                <FontAwesome5 name="file-upload" size={45} color="#C5B4E3" />
                <Text style={styles.uploadOptionText}>Upload from files</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 20,
    // Add padding to prevent content from hiding behind buttons
  },
  imageWithCross: {
    position: "absolute",
    top: 15, // Adjust top margin
    right: 5, // Adjust right margin
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  fieldHeader: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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
  imageBoundry:{
    flex: 10,
    flexDirection: "row",
    justifyContent: "center",
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
    width: 100,
    height: 100,
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

export default UploadButton;
