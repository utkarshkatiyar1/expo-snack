import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { InvoiceDetails } from "@/utils/type";
import { fetchInvoiceDetails } from "@/api/invoicedetails";
import { Payout } from "../../api/payout";

interface InvoiceDetailsProps {
  onOpenModal: (payout: Payout) => void; // Function to open the modal
  payout: Payout; // Specific payout details
}

const InvoiceDetailsScreen = () => {
  const { invoiceId } = useLocalSearchParams();
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [modalContent, setModalContent] = useState(""); // To dynamically set modal content

  useEffect(() => {
    if (invoiceId) {
      fetchDetails();
    }
  }, [invoiceId]);

  const fetchDetails = async () => {
    try {
      const details = await fetchInvoiceDetails(invoiceId as string);
      setInvoiceDetails(details);
    } catch (error) {
      console.error("Failed to fetch invoice details.");
    } finally {
      setLoading(false);
    }
  };
  const openModal = (content: string) => {
    setModalContent(content); // Set the content dynamically
    setIsModalVisible(true); // Show the modal
  };

  const closeModal = () => {
    setIsModalVisible(false); // Hide the modal
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!invoiceDetails) {
    return (
      <View style={styles.error}>
        <Text>Failed to load invoice details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        {invoiceDetails.display_status === "PENDING" && (
          <>
            <View style={styles.header}>
              <Text style={styles.processingStatus}>PROCESSING</Text>
              <Text style={styles.invoiceDate}>
                {invoiceDetails.updated_at}
              </Text>
            </View>
            <Text style={styles.processingInfo}>
              It takes 24 hours to process the payment
            </Text>
          </>
        )}

        {/* Invoice Details */}
        <View style={styles.invoiceCard}>
          <View style={styles.row}>
            <Text style={styles.invoiceValue}>
              ₹ {invoiceDetails.base_amount}
            </Text>
            <Text style={styles.payableAmount}>
              ₹ {invoiceDetails.payable_amounts[0]?.payable_amount}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.subText}>INVOICE VALUE</Text>
            <Text style={styles.subText}>PAYABLE AMOUNT</Text>
          </View>

          <Text style={styles.infoText}>
            {invoiceDetails.payable_amounts[0]?.tds_percent}% TDS as per Income
            tax
          </Text>

          {/* Add Divider */}
          <View style={styles.divider}></View>

          <Text style={styles.infoText}>
            GST: ₹{" "}
            {invoiceDetails.payable_amounts.reduce(
              (total, item) => total + (item.gst || 0),
              0
            )}
            .0
          </Text>
          <Text style={styles.infoText}>
            Total Commission: ₹{" "}
            {invoiceDetails.distributions.reduce(
              (total, item) => total + (item.commission_amount || 0),
              0
            )}
          </Text>
        </View>

        <Text style={styles.notice}>
          Payment of GST on Commission shall be processed once it is reflected
          in the GST Portal.
        </Text>

        {/* Billing Info */}
        <View style={styles.billingInfo}>
          <View style={styles.row2}>
            <Text style={styles.keyText}>Billing Company:</Text>
            <Text style={styles.valueText}>
              {invoiceDetails.payable_amounts[0]?.name}
            </Text>
          </View>
          <View style={styles.row2}>
            <Text style={styles.keyText}>GST:</Text>
            <Text style={styles.valueText}>
              {invoiceDetails.payable_amounts[0]?.gstin}
            </Text>
          </View>
          <View style={styles.row2}>
            <Text style={styles.keyText}>PAN:</Text>
            <Text style={styles.valueText}>
              {invoiceDetails.payable_amounts[0]?.pan}
            </Text>
          </View>
        </View>

        <Text style={styles.info}>Details</Text>

        {invoiceDetails.distributions.map((distribution, index) => (
          <View key={index} style={styles.details}>
            {/* First row: Name on the left, Commission Amount on the right */}
            <View style={styles.row1}>
              <Text style={styles.detailsTitle}>{distribution.name}</Text>
              <Text style={styles.commissionAmount}>
                ₹ {distribution.commission_amount}
              </Text>
            </View>

            {/* Second row: Amount on the left, LAN in the middle, Commission Structure on the right */}
            <View style={styles.row1}>
              <Text style={styles.detailsAmountTitle}>
                ₹ {distribution.disbursement_amount}
              </Text>
              <Text style={styles.lan}>• {distribution.lan}</Text>
              <Text style={styles.percentage}>
                {parseFloat(distribution.commission_structure).toFixed(1)}%
              </Text>
            </View>

            {/* Third row: Disbursement Date on the left, Commission Date on the right */}
            <View style={styles.row1}>
              <Text style={styles.date}>
                Disbursement Date: {distribution.disbursement_date}
              </Text>
              <Text style={styles.date}>{distribution.commission_date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => openModal("Payment Details")}
        >
          <Text style={styles.buttonText}>Payment Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonSecondary}
          // onPress={() => openModal("Invoice Details")}
        >
          <Text style={styles.buttonTextSecondary}>Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{modalContent}</Text>
              {/* Add additional content or details here */}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FE",
  },
  scrollContent: { paddingBottom: 100 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
    borderBottomColor: "#DFE7F5",
    flexDirection: "row", // Align items horizontally
    justifyContent: "space-between", // Space between items
    alignItems: "center", // Center vertically
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
  },
  processingStatus: {
    fontSize: 16,
    color: "orange",
    fontWeight: "600",
    marginTop: 8,
  },
  invoiceDate: {
    color: "gray",
    fontSize: 14,
  },
  processingInfo: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "orange",
  },
  invoiceCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B2B2B2",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  invoiceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  payableAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16A34A",
  },
  subText: {
    fontSize: 12,
    color: "#949494",
  },
  infoText: {
    fontSize: 14,
    marginTop: 8,
    color: "gray",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E6F0",
    marginVertical: 10, // Adds spacing around the divider
  },
  notice: {
    marginHorizontal: 16,
    fontSize: 12,
    marginTop: 12,
    color: "#3898F0",
  },
  billingInfo: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  keyText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  valueText: {
    fontSize: 14,
  },
  billingText: {
    fontSize: 14,
    marginBottom: 8,
  },
  info: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "bold",
    color: "black",
  },
  details: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0", // Light border
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between", // Space out items in the row
    alignItems: "center",
    marginBottom: 8, // Space between rows
  },
  detailsTitle: {
    fontSize: 18,
    color: "#000", // Black title
  },
  commissionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16A34A", // Green for emphasis
  },
  detailsAmountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000", // Dark font color
  },
  lan: {
    fontSize: 16,
    color: "#6B7280", // Gray for LAN
  },
  percentage: {
    fontSize: 16,
    // fontWeight: "bold",
    color: "#6B7280", // Green for percentage
  },
  date: {
    fontSize: 14,
    color: "#6B7280", // Gray font for dates
  },
  footer: {
    position: "absolute", // Fix the footer
    bottom: 0, // Align it at the bottom of the screen
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF", // Optional: Add a background color if needed
    width: "100%",
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1963ED",
    padding: 10,
    borderRadius: 18,
    alignItems: "center",
    marginRight: 8,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#1963ED",
    padding: 10,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#1963ED",
    fontSize: 18,
  },
  buttonTextSecondary: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end", // Align modal at the bottom
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim the background
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContent: {
    width: "80%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
});

export default InvoiceDetailsScreen;
