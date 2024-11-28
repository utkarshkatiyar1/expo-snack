import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { BillingCompanyDetails, fetchBillingCompanyDetails } from "../../api/billingCompanyDetails";
import { BillingCompanyItem } from "../../utils/type";
import { getCompanyTypeTitle } from "../../utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setViewUrl } from "@/store/profile";

const BillingCompanyDetailsPage = () => {
  const { billingCompanyId } = useLocalSearchParams();
  const navigation = useNavigation();

  const router= useRouter();
  const dispatch = useDispatch();
  const [data, setData] = useState<BillingCompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePress = (type: string) => {
    console.log("type",type);
    let doc="";
     if(type==="pan"){
        dispatch(setViewUrl(data?.pan_doc || ""));
        doc = data?.pan_doc || "";
     }
     else if(type==="gst"){
        dispatch(setViewUrl(data?.gst_doc || ""));
        doc = data?.gst_doc || "";
     }
     else if(type==="cheque"){
        dispatch(setViewUrl(data?.bank_account?.cancelled_cheque || ""));
        doc = data?.bank_account?.cancelled_cheque || "";
     }
     else if(type==="signature"){
        dispatch(setViewUrl(data?.signature || ""));
        doc = data?.signature || "";
     }
     else if(type==="service_agreement"){
        dispatch(setViewUrl(data?.service_agreement.url || ""));
        doc = data?.service_agreement.url || "";
      }
        
    console.log("doc",doc);
    router.push({
      pathname: "../../userDetails/ImageViewer",
      params: {
        doc: doc,
      },
    });
  };


  useEffect(() => {
    const getBillingCompanyDetails = async () => {
      if (billingCompanyId) {
        const details = await fetchBillingCompanyDetails(
          Number(billingCompanyId)
        );
        setData(details);

        setLoading(false);
      }
    };

    getBillingCompanyDetails();
    console.log("Fetching data for billing company: ", data);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!data) {
    return (
      <Text style={styles.errorText}>Billing company details not found.</Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Status Circle */}

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusCircle,
            data.display_status === "Approved"
              ? styles.statusCircleApproved
              : data.display_status === "Rejected"
              ? styles.statusCircleRejected
              : styles.statusCircleInProgress,
          ]}
        />
        <Text
          style={[
            styles.statusText,
            data.display_status === "Approved"
              ? styles.statusTextApproved
              : data.display_status === "Rejected"
              ? styles.statusTextRejected
              : styles.statusTextInProgress,
          ]}
        >
          {data.display_status || "Status not available"}
        </Text>

        {/* Conditionally render the status description */}
        {data.display_status === "In Progress" && (
          <Text style={styles.statusDescription}>
            It usually takes 24-48 hours for the KYC to be verified. We will
            inform you.
          </Text>
        )}
      </View>

      <View style={styles.dividerLine} />

      {/* Company Details */}
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.name || "N/A"}</Text>
        <Text style={styles.label}>Company Name</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.address || "N/A"}</Text>
        <Text style={styles.label}>Billing Address</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.place_of_supply || "N/A"}</Text>
        <Text style={styles.label}>Place Of Supply</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>
          {data.company_type ? getCompanyTypeTitle(data.company_type) : "N/A"}
        </Text>
        <Text style={styles.label}>Company Type</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.email || "N/A"}</Text>
        <Text style={styles.label}>Email Address</Text>
      </View>

      {/* GST and PAN Information */}
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.gstin || "N/A"}</Text>
        <Text style={styles.label}>GST Number</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.pan || "N/A"}</Text>
        <Text style={styles.label}>PAN Number</Text>
      </View>
      <TouchableOpacity  onPress={()=>handlePress("pan")}>
        <Text style={styles.link} >View</Text>
        <Text style={styles.label}>PAN</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>handlePress("gst")} >
        <Text style={styles.link}>View</Text>
        <Text style={styles.label}>GST</Text>
      </TouchableOpacity>

      {/* Divider Line */}
      <View style={styles.dividerLine} />

      {/* Bank Account Details */}
      <View style={styles.detailItem}>
       
        <Text style={styles.label}>Account Holder Name</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.bank_account?.ifsc || "N/A"}</Text>
        <Text style={styles.label}>Bank IFSC</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>{data.bank_account?.bank_id || "N/A"}</Text>
        <Text style={styles.label}>Bank Name</Text>
      </View>
      <View style={styles.detailItem}>

        <Text style={styles.label}>Account Type</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.value}>
          {data.bank_account?.account_number || "N/A"}
        </Text>
        <Text style={styles.label}>Account Number</Text>
      </View>

      {/* Documents */}
      <TouchableOpacity  onPress={()=>handlePress("cheque")}>
        <Text style={styles.link}>View</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Cancelled Cheque</Text>
      <TouchableOpacity onPress={()=>handlePress("signature")}>
        <Text style={styles.link}>View</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Signature</Text>
      <TouchableOpacity onPress={()=>handlePress("service_agreement")}>
        <Text style={styles.link}>View</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Service Agreement</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  statusCircleApproved: {
    backgroundColor: "green",
  },
  statusCircleRejected: {
    backgroundColor: "red",
  },
  statusCircleInProgress: {
    backgroundColor: "#F5A623", // Existing color for in-progress
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusTextApproved: {
    color: "green",
  },
  statusTextRejected: {
    color: "red",
  },
  statusTextInProgress: {
    color: "#F5A623", // Existing color for in-progress
  },
  statusDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  detailItem: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  link: {
    color: "blue",
    marginBottom: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default BillingCompanyDetailsPage;
