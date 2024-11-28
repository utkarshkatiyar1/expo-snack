import React, { useState, useEffect } from 'react';
import { RootState } from "@/store/index";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from "react-redux";
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Disbursement } from '@/store/applicationSlice';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Disbursed = () => {

  const [expanded, setExpanded] = useState(false);
  const { iddis } = useLocalSearchParams();
  const [dis, setDis] = useState<any>();
  const [disbursement, setDisbursement] = useState<Disbursement>()

  console.log(iddis + "     dis");


  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const router = useRouter();
  const handlePress = () => {
    router.back();
  }

  const { application, error } = useSelector(
    (state: RootState) => state.application
  );
  console.log("applicationin dis", application);
  useEffect(() => {
    setDisbursement(application?.disbursements?.find(item => item.id == Number(iddis)))
  }, [application]);



  console.log(disbursement);
  return (
    <View style={styles.outerContainer}>
      {/* Sticky collapsible component */}
      <View style={styles.stickyContainer}>
        <View style={[styles.card, styles.shadow]}>
          <View style={styles.row}>
            <View>
              <Text style={styles.header}>
                {application?.lead?.name}
              </Text>
              <Text style={styles.header}>
                {application?.lead?.loan_type?.display_name}
                {"   *   "} {application?.display_amount}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleExpand}>
              <Ionicons
                name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={24}
                color="blue"
              />
            </TouchableOpacity>
          </View>
          {/* Collapsible Content */}
          {expanded && (
            <View style={styles.details}>
              <View style={styles.column}>
                <Text style={styles.partnerName}>{application?.lending_partner.name}</Text>
                <Text style={styles.applicationId}>Application ID: {application?.bank_application_id}</Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <View style={styles.column}>
                <Text style={{}}>Sanctioned: {application?.display_sanctioned_amount}</Text>
                <Text style={{}}>Loan Insured: {application?.loan_insurance_added === true ? `Yes of ${application?.display_loan_insurance_amount}` : "No"}
                </Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <View style={styles.column}>
                <Text style={{}}>
                  {application?.disbursements.map((disbursement, index) => (
                    <Text key={index}>
                      LAN: {disbursement.loan_account_number}{"\n"}
                    </Text>
                  ))}</Text>
                <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
              </View>

              <TouchableOpacity onPress={() => handlePress()}>
                <View style={styles.column}>
                  <Text style={{ color: "#336ba1", fontSize: 14, fontWeight: 500 }}>View application details</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>



        <View style={styles.row}>
          <View style={styles.row}>

            {disbursement?.status === "approved" && <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>}


            <View>
              <Text
                style={[styles.status,
                {
                  color: disbursement?.status === "approved" ? "#64b86d"
                    : disbursement?.status === "rejected" ? "red"
                      : disbursement?.status === "changes_requested" ? "orange"
                        : "grey",
                },
                ]}
              >
                {"  "+disbursement?.display_status}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.date}>{disbursement?.display_disbursement_date}</Text>
            </View>
        </View>
        <View style={styles.dashedLine} />
      </View>


      {/* Scrollable content below */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
      {disbursement?.status === "changes_requested" &&
        <View>
          <Text style={styles.noteschanges}>{disbursement?.notes}</Text>
        </View>}

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.display_disbursement_type}</Text>
          <Text style={styles.header}>Disbursement Type</Text>
        </View>

        {disbursement?.status === "changes_requested" && <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.display_category}</Text>
          <Text style={styles.header}>Category</Text>
        </View>}

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.display_disbursement_amount}</Text>
          <Text style={styles.header}>Amount Disbursed</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.commission_on ==="disbursal_amount" ? "Disbursed Amount " : 
            disbursement?.commission_on ==="sanctioned_amount" ? "Sanctioned Amount " : disbursement?.commission_on
            }<Text style={{color:"#64b86d"}}>{disbursement?.display_disbursement_amount}</Text></Text>
          <Text style={styles.header}>Payout On</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.loan_account_number}</Text>
          <Text style={styles.header}>LAN Number</Text>
        </View>

        {disbursement?.branch_code && <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.branch_code}</Text>
          <Text style={styles.header}>Branch Code</Text>
        </View>}

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.otc_cleared === true ? "true" : "false"}</Text>
          <Text style={styles.header}>OTC Cleared</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>{disbursement?.pdd_cleared === true ? "true" : "false"} </Text>
          <Text style={styles.header}>PDD Cleared</Text>
        </View>

        <View style={styles.column}>
          <TouchableOpacity onPress={() => router.push({
            pathname: '../../(toptabs)/documents',
            params: { applicationId: JSON.stringify(application?.id) },
          })}><Text style={{ color: "#2f63c3", fontSize: 15, fontWeight: 500 }}>View</Text></TouchableOpacity>
          <Text style={styles.header}>Disbursement Letter</Text>
        </View>

        <View style={styles.column}>
          <TouchableOpacity onPress={() => router.push({
            pathname: '../../(toptabs)/documents',
            params: { applicationId: JSON.stringify(application?.id) },
          })}><Text style={{ color: "#2f63c3", fontSize: 15, fontWeight: 500 }}>View</Text></TouchableOpacity>
          <Text style={styles.header}>Bankers Confirmation</Text>
        </View>

      </ScrollView>

      {disbursement?.status === "changes_requested" && 
      <TouchableOpacity style={styles.button} onPress={() =>
        router.push({
          pathname: `./update-details`,
          params: { iddis:disbursement?.id },
        })
      }>
        <Text style={styles.buttonText}>View Changes</Text>
      </TouchableOpacity>}


    </View>
  );

}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  stickyContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 10
  },
  card: {
    borderWidth: 1,
    borderColor: '#ADD2E5',
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#fff',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  partnerName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  applicationId: {
    // fontSize: 12,
    color: '#777',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  noteschanges: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color:"orange"
  },
  subTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  details: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  loanText: {
    fontSize: 14,
    color: 'blue',
    fontWeight: 'bold',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollContent: {
    padding: 20,
  },
  column: {
    display: "flex",
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 7,
  },
  extraText: {
    fontSize: 16,
    marginBottom: 10,
  },
  header: {
    color: "#808080",
    marginBottom: 5,
  },
  dashedLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 15,
    marginBottom: 0
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#64b86d',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: "#007BFF",
    borderRadius: 17,
    paddingVertical: 11,
    paddingHorizontal: 1,
    alignItems: "center",
    marginVertical:20,
    marginHorizontal:10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});


export default Disbursed;
