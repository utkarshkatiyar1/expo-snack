import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Linking, StyleSheet, TouchableOpacity, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Application } from '@/utils/type';
import { deleteLead, leadApplications } from '@/api/lead';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { fetchApplicationSuccess } from '@/store/applicationSlice';
import { resetApplicationEdit, updateApplicationEdit } from '@/store/applicationEdit';
import { set } from 'react-hook-form';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import DeletModal from './DeleteModal';
import { useToast } from "react-native-toast-notifications";



const ApplicationList = () => {
  // const { applicationList } = useLocalSearchParams();
  const isFocused = useIsFocused();
  const toaster = useToast();

  const dispatch = useDispatch();
  const lead= useSelector((state: RootState) => state.application.lead);
  const [applicationListData, setApplicationListData] = React.useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [appStatus, setStatus] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleCloseModal = () => setIsModalVisible(false);
  const handleOpenModal = () => setIsModalVisible(true);
  const handleSubmit = () => {
    if(lead?.id){
    deleteLead(lead?.id.toString(),toaster);
    router.back();
    }
  };
  // const LeadId= JSON.parse(applicationList as string);
  // console.log(LeadId,"LeadId");

  const router = useRouter();
  const handlePress = (item: Application) => {
    
    console.log("item", item);
    router.push({
      pathname: '../(toptabs)',
      params: { applicationId: JSON.stringify(item.id) },
    });
  }

  const makeCall = (item: any) => {
    let phoneNumber = item?.bank_rm_phone_number
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error("Error making call:", err)
      );
    }
  };

  const editClicked = (item:Application) => {
    dispatch(updateApplicationEdit(item));
    console.log("editStaus",item.display_status);
    setStatus(item.display_status);
    if(item.display_status === "Application At Bank"){
     router.push({
      pathname:"/Lead/application",
      params: { purpose:"edit" }
    });
    }
    else{
      setModalVisible(true);
    }
  }

  const handleSelect = (item:any) => {
    console.log("selected",item);
    setSelectedOption(item.id);
    if(item.id === "1"){
      router.push({
        pathname:"/Lead/application",
        params: { purpose:"edit" }
      });
    }
    else{
      router.push({
        pathname:"/updateStatus/",
        params:{ purpose: "edit", status: appStatus  }

      })
    }
    setModalVisible(false);
  };

  const options = [
    { id: '1', label: 'Edit Application details' },
    { id: '2', label: 'Edit Sanctioned details' },
  ];

  useEffect(() => {
    if(lead?.id && isFocused){
    leadApplications(lead?.id.toString(),toaster).then((data) => {
      console.log(data,"application list");
      setApplicationListData(data.data.lead.applications);
    }).catch((error) => {
      console.log(error);
    });
  }
  },[isFocused]);


  const renderApplication = ({ item }: { item: Application }) => (
    <Pressable onPress={() => handlePress(item)} style={styles.container}>

      {item.display_status === "Disbursed" ?
        <View style={styles.carddis}>
          <View style={styles.infoContainer}>

            <View style={styles.column}>
            <View style={{flexDirection:"row",justifyContent:"space-between" ,alignItems:"center"}}>
                <Text style={styles.statusdis}>Application disbursed</Text>
                <TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={()=>editClicked(item)}>
                <MaterialIcons name="edit" size={15} color="#007BFF" />
                <Text style={{ color: "#007BFF",fontSize:15,paddingLeft:5,fontWeight:"500"}}>Edit</Text>
                </TouchableOpacity>
                </View>
              <Text style={[styles.applicationId,{marginTop:8}]}>{item.updated_at}</Text>
              <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
            </View>

            <View style={styles.column}>
              <Text style={styles.partnerName}>{item.lending_partner.name}</Text>
              <Text style={styles.applicationId}>Application ID: <Text style={{ color: '#000' }}>{item.bank_application_id}</Text></Text>
              <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
            </View>

            <View style={styles.column}>
              <Text style={styles.applicationId}>Sanctioned: <Text style={{ color: '#000' }}>{item.display_sanctioned_amount}</Text></Text>
              <Text style={styles.applicationId}>Loan Insured: <Text style={{ color: '#000' }}>{item.loan_insurance_added === true ? `Yes of ${item.display_loan_insurance_amount}` : "No"}
              </Text></Text>
              <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
            </View>

            <View style={styles.column}>
              <Text style={{}}>
                {item.disbursements.map((disbursement, index) => (
                  <Text style={styles.applicationId} key={index}>
                    LAN: <Text style={{ color: '#000' }}>{disbursement.loan_account_number}</Text>{"\n"}
                  </Text>
                ))}</Text>
              <View style={{ height: 1, backgroundColor: '#e2f0e2', width: '100%', marginVertical: 10 }} />
            </View>

            <View style={styles.column}>
              <Text style={{ color: "#336ba1", fontSize: 14, fontWeight: 500 }}>Disbursements</Text>
              <Text style={{color: '#000'}}>{item.disbursements.length} <Text style={{ color: '#777' }}>added till now</Text></Text>
              <Text style={{color: '#000'}}>{item.commission_amount != 0 ? item.display_commission_amount : "--"} <Text style={{ color: '#777' }}>Commission earned</Text></Text>
            </View>
          </View>
        </View> :

        item.display_status === "Application At Bank" ?
          <View style={styles.cardbank}>
            <View style={styles.infoContainer}>
              <View style={styles.column}>
                <View style={{flexDirection:"row",justifyContent:"space-between" ,alignItems:"center"}}>
                <Text style={styles.statusbank}>Application at bank</Text>
                <TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={()=>editClicked(item)}>
                <MaterialIcons name="edit" size={15} color="#007BFF" />
                <Text style={{ color: "#007BFF",fontSize:15,paddingLeft:5,fontWeight:"500"}}>Edit</Text>
                </TouchableOpacity>
                </View>
                <Text style={{ color: "#505558" }}>{item.updated_at}</Text>
                <View style={{ height: 1, backgroundColor: '#e1efef', width: '100%', marginVertical: 10 }} />
              </View>
              <View style={styles.column}>
                <Text style={styles.partnerName}>{item.lending_partner.name}</Text>
                <Text style={styles.applicationId}>Application ID: {item.bank_application_id}</Text>
              </View>
            </View>
          </View> :

          item.display_status === "Sanctioned" ?
            <View style={styles.cardsan}>
              <View style={styles.infoContainer}>
                <View style={styles.column}>
                <View style={{flexDirection:"row",justifyContent:"space-between" ,alignItems:"center"}}>
                <Text style={styles.statussan}>Application sanctioned</Text>
                <TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={()=>editClicked(item)}>
                <MaterialIcons name="edit" size={15} color="#007BFF" />
                <Text style={{ color: "#007BFF",fontSize:15,paddingLeft:5,fontWeight:"500"}}>Edit</Text>
                </TouchableOpacity>
                </View>
                  <Text style={{}}>{item.updated_at}</Text>
                  <View style={{ height: 1, backgroundColor: '#f2f5e2', width: '100%', marginVertical: 10 }} />
                </View>

                <View style={styles.column}>
                  <Text style={styles.partnerName}>{item.lending_partner.name}</Text>
                  <Text style={styles.applicationId}>Application ID: <Text style={{ color: 'blue' }}>{item.bank_application_id}</Text></Text>
                  <View style={{ height: 1, backgroundColor: '#f2f5e2', width: '100%', marginVertical: 10 }} />
                </View>

                <View style={styles.column}>
                  <Text style={{}}>Loan Amount: {item.display_amount}</Text>
                  <Text style={{}}>Loan Insured: {item.loan_insurance_added === true ? `Yes of ${item.display_loan_insurance_amount}` : "No"}</Text>
                  <Text style={{}}>Sanctioned Amount: {item.display_sanctioned_amount}</Text>
                  <Text style={{}}>Date: {item?.display_sanctioned_date ? item?.display_sanctioned_date : "--"}</Text>
                  <TouchableOpacity onPress={() => router.push({
                    pathname: '../(toptabs)/documents',
                    params: { applicationId: JSON.stringify(item.id) },
                  })}><Text style={{ color: "#2f63c3", fontSize: 15, fontWeight: 500 }}>View Letter</Text></TouchableOpacity>
                  <View style={{ height: 1, backgroundColor: '#f2f5e2', width: '100%', marginVertical: 10 }} />
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={{}}>Bank RM: {item?.bank_rm_name}</Text>
                    <Text style={{}}>{item?.bank_rm_phone_number}</Text>
                  </View>
                  <Text style={{ color: "#2f63c3", fontSize: 19, fontWeight: 500, }} onPress={() => makeCall(item)}>Call</Text>

                </View>




              </View>
            </View> :

            <View style={styles.card}>
              <View style={styles.infoContainer}>
                <Text style={styles.status}>{item.display_status}</Text>
                <Text style={styles.partnerName}>{item.lending_partner.name}</Text>
                <Text style={styles.applicationId}>ID: {item.bank_application_id}</Text>
              </View>
            </View>}

    </Pressable>
  );

  const handleButtonPress = () => {
    // Handle button press action
    // router.push({
    //   pathname: '../Lead/application',
    //   params: { leadId: LeadId },
    // }
    // );
    dispatch(resetApplicationEdit());
    router.push({
      pathname:"/Lead/application",
      params: { purpose:"create" }
    });
    console.log("Button Pressed");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerText}>Application Details</Text> */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={25} color="black" />
        </TouchableOpacity>
        <View style={styles.headerDetails}>
          <View style={{flexDirection:"column" }}>
          <Text style={styles.bankNameText}>{lead?.name}</Text>
          <View style={{flexDirection:"row"}}>
            <Text style={{paddingRight:5,color:"grey"}}>{lead?.loan_type?.display_name}</Text>
            <Text style={{paddingLeft:5,paddingRight:5,color:"grey"}}>{lead?.display_loan_amount}</Text>
            <Text style={{paddingLeft:5,color:"grey"}}>{lead?.count} {(lead?.count ?? 0 )> 1 ?"applications":"application"} </Text>
          </View>
         </View>
         <View style={{flexDirection:"row"}}>
         {lead?.is_lead_editable&& <TouchableOpacity  onPress={()=> router.push({
        pathname:"/Lead",
        params: { purpose:"edit" }
      })}>
         <MaterialIcons name="edit" size={15} color="#007BFF" style={{padding:5}} />
          </TouchableOpacity>
           }
          {lead?.is_lead_deletable&&<TouchableOpacity  onPress={()=>{
            handleOpenModal();
          }}>
         <AntDesign name="delete" size={15} color="red" style={{padding:5}}/>
          </TouchableOpacity>
           }
          
         </View>
        </View>
      </View>
      <FlatList
        data={applicationListData}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false} // Hides vertical scroll bar
        showsHorizontalScrollIndicator={false} 
      />
     <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.buttonCancel}  onPress={handleButtonPress}>
          <Text style={styles.cancelButtonText}>Add Application</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
       
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What would you like to edit ?</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionContainer}
                  onPress={() => handleSelect(item)}
                >
                  <MaterialIcons name="edit" size={15} color="#007BFF" />
                  <Text style={styles.optionText}>{item.label}</Text>
                  
                </TouchableOpacity>
              )}
            />
            
          </View>
        </View>
      </Modal>
      <DeletModal
      visible={isModalVisible}
      onClose={handleCloseModal}
      onSubmit={handleSubmit}
       />
       
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  listContent: {
    paddingBottom: 0, // Ensure space for button
  },
  status: {
    fontSize: 16,
    padding: 8,
  },
  card: {
    // flexDirection: 'row',
    // marginBottom: 12,
    // elevation: 3,
    backgroundColor: '#f4fff0',
    borderRadius: 25,
    padding: 16,
    marginVertical: 8,
    elevation: 6, // For Android shadow
    shadowColor: '#67b675', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: '#67b675',
    borderWidth: 1
  },
  carddis: {
    backgroundColor: '#f4fff0',
    borderRadius: 25,
    padding: 16,
    marginVertical: 8,
    elevation: 6, // For Android shadow
    shadowColor: '#67b675', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderColor: '#67b675',
    borderWidth: 1
  },
  cardbank: {
    backgroundColor: '#f5fdff',
    borderRadius: 25,
    padding: 16,
    marginVertical: 8,
    elevation: 6, // For Android shadow
    shadowColor: '#246475', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    // shadowRadius: 4,
    borderColor: '#246475',
    borderWidth: 1
  },
  cardsan: {
    backgroundColor: '#fdfff4',
    borderRadius: 25,
    padding: 16,
    marginVertical: 8,
    elevation: 6, // For Android shadow
    shadowColor: '#67b675', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    // shadowRadius: 4,
    borderColor: '#e9b341',
    borderWidth: 1
  },
  statusdis: {
    fontSize: 17,
    color: '#67b675',
    fontWeight: "500"
  },
  statusbank: {
    fontSize: 17,
    color: '#246475',
    fontWeight: "500"
  },
  statussan: {
    fontSize: 17,
    color: '#dea22d',
    fontWeight: "500"
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  partnerName: {
    fontSize: 16,
    color: '#777',
    marginBottom: 2,
  },
  applicationId: {
    fontSize: 14,
    color: '#777',
  },
  button: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 15,
    borderColor: '#007bff',
    borderWidth: 1,
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  buttonContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginHorizontal: 2,
    marginVertical: 4,
    alignItems: "center"
  },
  buttonCancel: {
    flex: 1,
    backgroundColor: "#fff", // Red for Cancel
    padding: 10,
    marginRight: 10,
    borderRadius: 15,
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "500",

  },
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    color: 'grey',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '400',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    // backgroundColor: '#fff', // Customize header background color
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  backButton: {
   width:"10%",
    justifyContent:"center",
  },
  headerDetails: {
    width:"90%",  
    flexDirection: 'row',
    justifyContent:"space-between",
    alignItems: 'center',
  },
  applicationIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationIdLabel: {
    fontSize: 16,
    color: 'gray',
  },
  applicationIdNumber: {
    fontSize: 18,
    color: 'black',
    marginLeft: 5,
  },
  bankNameText: {
    fontSize: 18,
    color: 'dark gray',
  },
  
 
 

});

export default ApplicationList;
