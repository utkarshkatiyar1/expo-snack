// BankCodesScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { fetchCommissionStructure, BankCode } from "../api/bankcodes"; // Import from the service

const BankCodesScreen = () => {
  const [bankCodes, setBankCodes] = useState<BankCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Fetch bank codes data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCommissionStructure(); // Fetch data from the service
        setBankCodes(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter the bank codes based on search and selected product
  const filteredBankCodes = bankCodes.filter((item) => {
    const matchesSearchQuery =
      item.bankname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProduct = selectedProduct
      ? item.product?.toLowerCase() === selectedProduct.toLowerCase()
      : true;

    return matchesSearchQuery && matchesProduct;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <ScrollView horizontal={true} style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === null && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct(null)}
        >
          <Text style={styles.filterButtonText}>All Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "Home Loan" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("Home Loan")}
        >
          <Text style={styles.filterButtonText}>Home Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "LAP" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("LAP")}
        >
          <Text style={styles.filterButtonText}>LAP</Text>
        </TouchableOpacity>
        {/* Add more filter buttons as needed */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "Working Capital" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("Working Capital")}
        >
          <Text style={styles.filterButtonText}>Working Capital</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "Education loan" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("Education loan")}
        >
          <Text style={styles.filterButtonText}>Education Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "Business loan" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("Business loan")}
        >
          <Text style={styles.filterButtonText}>Business Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedProduct === "Car loan" && styles.activeFilterButton,
          ]}
          onPress={() => setSelectedProduct("Car loan")}
        >
          <Text style={styles.filterButtonText}>Car Loan</Text>
        </TouchableOpacity>
      </ScrollView>

      <TextInput
        style={styles.searchInput}
        placeholder="Search Bank, Branch, or Code"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <View style={styles.Bankheader}>
        <View>
          <Text>Bank & Branch</Text>
        </View>
        <View>
          <Text>Code</Text>
        </View>
      </View>

      <FlatList
        data={filteredBankCodes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{item.bankname}</Text>
              <Text style={styles.bankInfo}>{item.branch}</Text>
            </View>
            <Text style={styles.code}>{item.code}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
  },
  // Main filter container that holds the buttons horizontally
  filterContainer: {
    marginTop: 15,
    paddingLeft: 10, // Add some padding to the start of the filter row
    marginBottom: 16,
    minHeight: 50,
  },
  // Content container for ScrollView to handle alignment properly
  filterContentContainer: {
    flexDirection: "row",
    alignItems: "center", // Ensure all buttons are vertically aligned
  },
  // Button styles
  filterButton: {
    height: 35,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5, // Space between each button horizontally
    backgroundColor: "#fff",
    borderRadius: 15,
    borderColor: "#e0e0e0",
    borderWidth: 2,
    justifyContent: "center", // Center the text inside the button
  },
  activeFilterButton: {
    backgroundColor: "#e0e0e0",
  },
  filterButtonText: {
    color: "#000",
    fontWeight: "600",
    justifyContent: "center",
    marginTop: -2,
    // fontSize: 50,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10, // Add spacing on both sides
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  Bankheader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default BankCodesScreen;
