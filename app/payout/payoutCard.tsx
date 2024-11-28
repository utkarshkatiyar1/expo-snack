import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Payout } from "../../api/payout";

interface PayoutCardProps {
  payout: Payout;
  onPress: () => void;
}

const PayoutCard: React.FC<PayoutCardProps> = ({ payout, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.payoutItem}>
        <Text style={styles.amount}>{payout.display_amount_credited}</Text>
        <Text style={styles.companyName}>
          {payout.invoice.billing_company_name}
        </Text>
        <Text style={styles.companyName}>{payout.payment_reference_id}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  payoutItem: {
    backgroundColor: "#FFF",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default PayoutCard;
