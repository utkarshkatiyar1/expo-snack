import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { fetchCommissionData, CommissionItem } from "../../api/commissionstructure";

const CommissionStructure: React.FC = () => {
  const [data, setData] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchCommissionData();
      if (result) {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatPercentage = (number: number | null) => {
    return number !== null ? `${number.toFixed(1)} %` : "0.0 %";
  };

  const renderRow = ({ item, index }: { item: CommissionItem, index: number }) => (
    <View style={[styles.row, index % 2 === 0 && styles.alternateRow]}>
      <View style={styles.columnLeft}>
        <Text style={styles.bankName}>{item.loan_type.display_name}</Text>
        <Text style={styles.date}>{item.updated_at ? item.updated_at : ""}</Text>
      </View>
      <View style={styles.columnRight}>
        <Text style={{fontSize: 14, fontWeight: "500", color: "#333", paddingLeft: 20,}}>
          {formatPercentage(item.absolute_revenue_commission_processed_by_self)}
        </Text>
        <Text style={{fontSize: 14, fontWeight: "500", color: "#333", paddingLeft: 70,}}>
          {formatPercentage(item.absolute_revenue_commission_processed_by_ln)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderRow}
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerText}>Bank Name</Text>
          <Text style={styles.headerText}>Self</Text>
          <Text style={[styles.headerText, styles.ln]}>LN</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingRight: 30,

  },
  headerText: {
    fontSize: 14,
    color: "gray",
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingRight: 30,
  },
  alternateRow: {
    backgroundColor: "#fff", // Alternate row color
  },
  columnLeft: {
    flex: 1, // Adjusted flex for better alignment
  },
  columnRight: {
    flex: 2, // Adjusted flex for better alignment
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 30,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginHorizontal: 10,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    color: "#777",
    marginHorizontal: 10,

  },

  ln: {
    textAlign: "center", // Ensure LN is centered in the header
    paddingRight: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommissionStructure;
