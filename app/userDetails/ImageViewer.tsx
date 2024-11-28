// pages/ImageViewer.tsx
import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Pdf from 'react-native-pdf';
import { getFileUrl } from "@/api/uploaddoc";
import { set } from "react-hook-form";

const ImageViewer = () => {
  const [docUrl,setDocUrl]=useState("");
  // Get the specific parameter from navigation params
  const url = useSelector((state: RootState) => state.util.url);
 
  useEffect(() => {
     console.log("urldox",url)
    
     if (typeof url === 'string' && (url.startsWith("https") || url.startsWith("file"))) {
        setDocUrl(url);
      }
      else{
        const key =url as string;
        if(key){
          getFileUrl(key).then((data) => {
               console.log(data," got the url");
                setDocUrl(data);
          }).catch((error) => {
            console.log(error);
          });
        }  
      }
  }, []);

  
  // let imageUrl = "";
  // if (imgOption.type === "sign") {
  //   imageUrl = billingData?.signature ?? "";
  // } else if (imgOption.type === "cheque") {
  //   imageUrl = billingData?.bank_account?.cancelled_cheque ?? "";
  // } else if (imgOption.type === "gst") {
  //   imageUrl = billingData?.gst_doc ?? "";
  // } else if (imgOption.type === "pan") {
  //   imageUrl = billingData?.pan_doc ?? "";
  // } else if (imgOption.type==="sanctioned_letter"||imgOption.type==="disbursement_letter"||imgOption.type==="bankers_confirmation") { 
  //   imageUrl = docUrl;
  // }

  const isPdf =docUrl.includes('.pdf')
  console.log("isPdf",isPdf,docUrl);
 
  return (
    <View style={styles.container}>
      
      {
        docUrl? (isPdf ?
          <Pdf
          source={{ uri: docUrl, cache: false }}
          trustAllCerts={false}
          style={styles.pdf}
          onLoadProgress={(percent) => console.log(`PDF Load Progress: ${percent}%`)}
          onLoadComplete={(pageCount) => console.log(`PDF Loaded with ${pageCount} pages`)}
          onError={(error) => console.error("PDF Load Error:", error)}
          /> 
          : 
          
            <Image
          source={{ uri: docUrl }}
          style={styles.image}
          resizeMode="contain"
        />):<Text>Document not found</Text>
       
      }
    </View>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Dark background for better focus on image
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    
  },
  image: {
    width: "100%", // Full width
    height: "70%", // 70% height of the screen
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    height: "70%",
    borderColor: "black",
    borderWidth: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
}
});
