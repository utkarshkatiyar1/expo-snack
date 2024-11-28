import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchBillingCompanyData,
  BillingCompanyItem,
} from "../../api/billingcompany";
import { MaterialIcons } from "@expo/vector-icons"; // Import for arrow icon
import { set } from "react-hook-form";

const BillingCompanyPage = () => {
  const [data, setData] = useState<BillingCompanyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMoreData, setFetchingMoreData] = useState(false);
  const router = useRouter();

  console.log("sdjfhdsj",hasMore,fetchingMoreData);
  const fetchData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const billingCompanies = await fetchBillingCompanyData(page, size);
      if (billingCompanies?.data.length > 0) {
        setData((prevData) => [...prevData, ...billingCompanies?.data]);
          setPage((prevPage) => prevPage + 1);
      }
      else{
        setHasMore(false);
      }
      
    }catch (error) {
      console.error("Error fetching billing company data: ", error);
     
    }finally {
      setLoading(false);
      
    }
  };

  useEffect(() => {
    fetchData();
    console.log("Fetching data for page: ", data);

  }, []);

  // const loadMoreData = () => {
  //   if (!isMoreLoading) {
  //     setIsMoreLoading(true);
  //     setPage((prevPage) => prevPage + 1);
  //   }
  // };

  const RenderItem = React.memo(({ item }: { item: BillingCompanyItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        router.push({
          pathname: "/profiledata/Billingcompanynext",
          params: { billingCompanyId: item.id },
        })
      }
    >
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text
          style={[
            styles.status,
            item.display_status === "Approved"
              ? styles.approved
              : styles.rejected,
          ]}
        >
          {item.display_status}
        </Text>
      </View>
      <Text style={styles.label}>{item.address}</Text>
      <Text style={styles.label}>GST: {item.gstin || "N/A"}</Text>
      <Text style={styles.label}>PAN: {item.pan}</Text>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color="gray"
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  ));

 
  return (
    <View style={styles.wrapper} >
      <FlatList
        data={data}
        renderItem={({ item }) => <RenderItem item={item} />}
        keyExtractor={(item, index) => index.toString()} // Ensure unique, consistent keys
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
        initialNumToRender={8} // Render only 8 items at first
        windowSize={10} // Buffer for rendering items around the viewport
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : null
        }
      />
      <View  style={styles.Button}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/userDetails/secondForm")} // Navigate to the next form
      >
        <Text style={styles.addButtonText}>Add Billing Company</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f5f5f9",
  },
  container: {
    padding: 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    margin:15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: "relative",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    maxWidth: 280,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
  },
  approved: {
    color: "green",
  },
  rejected: {
    color: "orange",
  },
  label: {
    marginBottom: 5,
    color: "#555",
  },
  arrowIcon: {
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  Button:{
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#fff", // Red for Cancel
    padding: 10,
    marginRight: 10,
    borderRadius: 15,
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  addButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "500",
  },
});

export default BillingCompanyPage;
