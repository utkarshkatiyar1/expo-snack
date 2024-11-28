import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, StyleSheet } from "react-native";
import { fetchPayouts, Payout } from "../../api/payout";
import { useRouter } from "expo-router";
import PayoutCard from "../payout/payoutCard"; // Import the PayoutCard component

const PayoutsScreen = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getPayouts = async () => {
      const data = await fetchPayouts();
      if (data) {
        setPayouts(data);
      }
    };

    getPayouts();
  }, []);

  const filteredPayouts = payouts.filter((payout) =>
    payout.invoice.billing_company_name
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredPayouts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PayoutCard
            payout={item}
            onPress={() =>
              router.push({
                pathname: "../payout/invoicedetails/",
                params: { invoiceId: item.invoice.id.toString() },
              })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },
  searchBar: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 20,
  },
});

export default PayoutsScreen;
