import React from 'react';
import { View, Text, TouchableOpacity, Linking, FlatList, StyleSheet, Pressable } from 'react-native';
import { LeadObject } from '@/utils/type'; // Adjust import path based on your project structure
import { useRouter } from 'expo-router';
import { updateLead } from '@/store/applicationSlice';
import { useDispatch } from 'react-redux';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

interface Props {
  leadsListData: LeadObject[];
}

const LeadCard: React.FC<Props> = ({ leadsListData }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const handlePress = (item: LeadObject) => {
    console.log("clicked", item.lead);
    // router.push('../Lead/applicationList');
    dispatch(updateLead({
      action_on_lead_allowed: item.lead.action_on_lead_allowed,
      id: item.lead.id,
      name: item.lead.name,
      loan_type: {
        id: item.lead.loan_type.id,
        display_name: item.lead.loan_type.display_name,
        name: item.lead.loan_type.name
      },
      is_lead_editable: item.lead.is_lead_editable,
      is_lead_deletable: item.lead.is_lead_deletable,
      display_loan_amount: item.lead.display_loan_amount,
      loan_amount: item.lead.loan_amount,
      count: item.application_count,
      pan: item.lead.pan,
      phone_number: item.lead.phone_number,
      processing_by: item.lead.processing_by,
      sub_loan_type: item.lead.sub_loan_type,
      notes: item.lead.notes,
      employment_type: item.lead.employment_type,
      dsa_id: item.lead.dsa_id,
    }));
    router.push('../Lead/applicationList');
    // Optional: Display an alert with the name
  };

  const makeCall = (item: LeadObject) => {
    let phoneNumber = item?.contact_details?.client?.mobile_number || item?.contact_details?.employee?.phone_number || item?.contact_details?.dsa?.phone_number
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error("Error making call:", err)
      );
    }
  };


  const renderLeadCard = ({ item }: { item: LeadObject }) => {
    return (

      <Pressable onPress={() => handlePress(item)} style={styles.container}>
        <View style={styles.card} >
          {/* {leadsListData.map((lead, index) => ( */}

          {/* Row 1 */}

          <View style={styles.column}>

            <Text style={styles.text}>{item?.lead?.name || 'N/A'}</Text>
            <Text style={styles.row}>
              <Text style={styles.textgreen}>
                ₹{item?.lead?.loan_amount || '0'}
              </Text>{"     "}
              <Text style={styles.textgreen}>
                {item?.lead?.display_loan_amount || 'N/A'}
              </Text>
            </Text>
            <View style={{ height: 1, backgroundColor: '#eeeeee', width: '100%', marginVertical: 10 }} />

          </View>



          {/* Row 2 */}
          <View style={styles.column}>
            <View style={styles.row}>
              <Text style={{ fontSize: 16, fontWeight: 300 }}>
                {item?.lead?.loan_type?.display_name || 'N/A'}
              </Text>
              <Entypo name="dot-single" size={20} color="#dbdbdb" />
              <Text style={{ fontSize: 16, fontWeight: 300 }}>
                {item?.application_count || 0} applications
              </Text>
            </View>
            <Text style={[
              item?.contact_details?.processing_by_title === "PROCESSED BY SELF" && styles.text2,
              item?.contact_details?.processing_by_title === "IN HOUSE LEAD" && styles.text2black,
              item?.contact_details?.processing_by_title === "PROCESSED BY LOAN NETWORK" && styles.text2blue,
            ]}>
              {item?.contact_details?.processing_by_title || 'N/A'}
            </Text>
            <View style={{ height: 1, backgroundColor: '#eeeeee', width: '100%', marginVertical: 10 }} />

          </View>



          {/* Row 3 */}
          {item?.lead?.applications?.length > 0 && <View style={styles.column}>
            <Text style={styles.text}>
              <Text style={{ fontSize: 13, fontWeight: 300 }}> Application ID: </Text>{item?.lead?.applications?.[0].bank_application_id || 'No Applications'}
            </Text>
            {item?.lead?.applications?.length > 1 && <Text style={styles.textBlue}>
              +{item?.lead?.applications?.length - 1} more
            </Text>}
            <View style={{ height: 1, backgroundColor: '#eeeeee', width: '100%', marginVertical: 10 }} />
          </View>

          }



          {/* Row 4 */}
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.column}>
              <Text style={styles.text}>
                {item?.contact_details?.client?.name || item?.contact_details?.employee?.name || item?.contact_details?.dsa?.name}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 300 }}>
                {item?.contact_details?.client?.name ? "Client" : item?.contact_details?.employee?.name ? "Employee" : "DSA"}
              </Text>
            </View>

            <TouchableOpacity style={styles.text4} onPress={() => makeCall(item)}>
              <Feather name="phone-call" size={24} color="#2b65d3" />
              <Text style={{
                fontSize: 14,
                color: '#2b65d3',
                fontWeight: "500",
              }}>{"  "}Call Client</Text>
            </TouchableOpacity>
          </View>



          {/* Row 5 */}
          {/* <View style={styles.column}>
          <Text style={styles.text}>
            Crazy1314
            </Text>

        <View style={styles.row}>
            <Text style={styles.text}>
                DSA
            </Text>
            <Text style={{fontSize:13, fontWeight:300}}>
              Org13
            </Text>
          </View>
          </View> */}

          {/* ))} */}
        </View>
      </Pressable>
    )
  };

  return (
    <FlatList
      data={leadsListData}
      renderItem={renderLeadCard}
      keyExtractor={(item) => item.lead.id.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    marginVertical: 8,
    elevation: 6, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: "#b8b4be",
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // marginHorizontal: 2,
    marginVertical: 4,
    alignItems: "center"
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  text: {
    fontSize: 17,
    color: '#333',
    fontWeight: "medium"
  },
  text2: {
    fontSize: 14,
    color: '#af9e4f',
    fontWeight: "700"
  },
  text2black: {
    fontSize: 14,
    color: '#555555',
    fontWeight: "700"
  },
  text2blue: {
    fontSize: 14,
    color: '#55aeaa',
    fontWeight: "700"
  },
  textgreen: {
    fontSize: 17,
    color: '#67b675',
    fontWeight: "medium"
  },
  text4: {
    fontSize: 14,
    color: '#2b65d3',
    fontWeight: "500",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#2b65d3',
    padding: 9,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "row"
  },
  textBlue:{
    fontSize: 14,
    color: '#2b65d3',
    fontWeight: "500",
  },
});

export default LeadCard;
