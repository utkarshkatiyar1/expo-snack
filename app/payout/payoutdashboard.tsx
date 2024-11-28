// PayoutDashboard.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { fetchPayoutData } from "../../api/payoutdashboard"; // Adjust the import path accordingly
import { PayoutData } from "@/utils/type"; // Make sure to adjust the import path

const PayoutDashboard = () => {
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPayoutData = async () => {
      const data = await fetchPayoutData();
      setPayoutData(data);
      setLoading(false);
    };

    getPayoutData();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : payoutData ? (
        <View style={styles.card}>
          <Text style={styles.title}>TOTAL EARNINGS</Text>
          <Text style={styles.amount}>{payoutData.total_payout}</Text>
          <Text style={styles.subtitle}>{payoutData.dsa_joined_days}</Text>
          <TouchableOpacity style={styles.arrowButton}>
            <Text style={styles.arrowText}>➔</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>Error loading data</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 40,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#3774ED",
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 15,
    shadowColor: "#000",
    zIndex: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: "#21427",
    elevation: 3, // For Android shadow
  },
  title: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 8,
    fontWeight: "600",
  },
  amount: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 4,
  },
  arrowButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
  },
  arrowText: {
    fontSize: 18,
    color: "#1e6ed1",
  },
});

export default PayoutDashboard;
