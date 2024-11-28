import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const EmptyLeads = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
      <FontAwesome name="user-circle-o" size={24} color="#94d2e0" />
      </View>
      <Text style={styles.title}>No Leads Added Yet</Text>
      <Text style={styles.subtitle}>
        Start adding leads by providing leads basic details
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add Lead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#E9F5FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    tintColor: "#8CC2DB", // Light blue tint
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999999",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 17,
    paddingVertical: 12,
    paddingHorizontal: 100,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default EmptyLeads;
