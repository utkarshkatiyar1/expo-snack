import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationStart, fetchApplicationSuccess, fetchApplicationFailure } from '@/store/applicationSlice';
import { RootState } from '@/store/index';

import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap
} from "@react-navigation/material-top-tabs";

const { Navigator } = createMaterialTopTabNavigator();
import { useLocalSearchParams, withLayoutContext, useRouter } from 'expo-router';
import { ParamListBase, TabNavigationState, useIsFocused } from '@react-navigation/native';
import { applicationDetails, deleteApplication } from '@/api/lead';
import { set } from 'react-hook-form';
import Application from '../Lead/application';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import DeletModal from '../Lead/DeleteModal';
import { useToast } from "react-native-toast-notifications";

export interface Document {
  created_at: string;
  display_name: string;
  id: number;
  type: string;
  uploaded_by_type: string;
  url: string;
}

export interface Disbursement {
  pdd_cleared: boolean;
  category: string;
  additional_payout_percent: number | null;
  disbursement_type: string;
  notes: string | null;
  status: string;
  documents: Document[];
  has_additional_payout: boolean;
  display_disbursement_date: string;
  id: number;
  additional_payout: number | null;
  display_disbursement_amount: string;
  disputed_reason: string | null;
  updated_at: string;
  lead: string | null;
  otc_cleared: boolean;
  rejected_reason: string | null;
  branch_code: string | null;
  commission_on: string;
  display_acknowledgement_status: string;
  absolute_revenue_commission_unit: string;
  display_commission_amount: string | null;
  billing_company: string | null;
  display_category: string;
  disbursement_amount: number;
  display_disbursement_type: string;
  absolute_revenue_commission: number;
  loan_account_number: string;
  custom_rejected_reason: string;
  disbursement_date: string;
  acknowledgement_status: string | null;
  display_status: string;
  commission_amount: number | null;
}

export interface ExternalDsa {
  id: number | null;
  name: string | null;
}

export interface LoanAccountNumber {
  category: string;
  loan_account_number: string;
}

export interface LeadLoanType {
  display_name: string;
  id: number;
  name: string;
}

export interface Lead {
  action_on_lead_allowed: boolean;
  category: string | null;
  created_by_id: number;
  display_employment_type: string;
  display_loan_amount: string;
  display_status: string;
  dsa_id: number;
  employment_type: string;
  id: number;
  is_lead_deletable: boolean;
  is_lead_editable: boolean;
  loan_amount: number;
  loan_type: LeadLoanType;
  name: string;
  notes: string | null;
  pan: string;
  phone_number: string;
  processing_by: string;
  status: string;
  sub_loan_type: string | null;
}

export interface Update {
  created_at: number;
  display_amount: string;
  display_created_at: string;
  display_status: string;
  id: number;
  loan_account_number: string | null;
  otc_cleared: boolean | null;
  pdd_cleared: boolean | null;
  status: string;
}

export interface LendingPartner {
  active: boolean;
  commission_on: string;
  email_domains: string[];
  id: number;
  logo: string;
  name: string;
  order: number;
  slug: string | null;
  type: string;
}

export interface Application {
  disbursements: Disbursement[];
  add_disbursement: boolean;
  external_dsa: ExternalDsa;
  status: string;
  documents: Document[];
  is_from_external_dsa: boolean;
  is_application_deletable: boolean;
  logged_in_date: string;
  loan_account_numbers: LoanAccountNumber[];
  display_amount: string;
  id: number;
  external_dsa_bank_code: string | null;
  bank_rm_phone_number: string;
  updated_at: string;
  sanctioned_amount: number;
  bank_rm_name: string;
  lead_id: number;
  is_external_dsa_edit_allowed: boolean;
  los_id: string | null;
  lead: Lead;
  email_domains: string[];
  rejected_reason: string | null;
  branch_name: string;
  bank_rm_email_address: string;
  loan_insurance_added: boolean;
  display_sanctioned_amount: string;
  sanctioned_date: string;
  amount: number;
  display_sanctioned_date: string;
  display_loan_insurance_amount: string;
  display_commission_amount: string;
  bank_application_id: string;
  updates: Update[];
  loan_account_number: string;
  lending_partner: LendingPartner;
  custom_rejected_reason: string;
  loan_insurance_amount: number;
  display_status: string;
  commission_amount: number;
}

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function Layout() {
  const router = useRouter();
  const toaster = useToast(); // Get toaster instance

  const isFocused = useIsFocused();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleCloseModal = () => setIsModalVisible(false);
  const handleOpenModal = () => setIsModalVisible(true);
 

  const { application,  error } = useSelector((state: RootState) => state.application);
   const dispatch = useDispatch();
   const applicationId = (useLocalSearchParams().applicationId);

   const handleSubmit = async() => {
    console.log("Delete");
    try{
      if(applicationId){
        console.log(applicationId,"applicationId for delete");
           const response=await deleteApplication(applicationId as string, toaster);
           console.log(response,"responseDelete");
      }
    }
    catch(err){
      console.log(err);
    }
    setIsModalVisible(false);
    router.back();
  }
    
   const handleDelete = async (applicationId: string | null) => {
    handleOpenModal();      
   }
  useEffect(() => {
     console.log(JSON.parse(applicationId as string),"applicationId");
    const fetchApplications = async () => {
      dispatch(fetchApplicationStart());
      try {
        const response = await applicationDetails(JSON.parse(applicationId as string), toaster); // replace with your API call
        dispatch(fetchApplicationSuccess(response.data.application));  
      }
      catch (err : any) {
        dispatch(fetchApplicationFailure(err.message));
      }
    };

    if (isFocused){
      fetchApplications();
    }
    
  }, [isFocused]);
  
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <Text style={styles.headerText}>Application Details</Text> */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
        <Ionicons name="chevron-back" size={25} color="black" />
        </TouchableOpacity>
        <View style={styles.headerDetails}>
          <View style={styles.applicationIdContainer}>
            <Text style={styles.applicationIdLabel}>Application ID:</Text>
            <Text style={styles.applicationIdNumber}>{application?.bank_application_id}</Text>
          </View>
          <Text style={styles.bankNameText}>{application?.lending_partner?.name}</Text>
        </View>
       {application?.is_application_deletable&& <TouchableOpacity  onPress={()=>handleDelete(applicationId as string)} style={{marginTop:7,marginLeft:5}}>
         <AntDesign name="delete" size={15} color="red" style={{padding:5}}/>
        </TouchableOpacity>
       }

      </View>

      {/* Status Header */}
      <View style={[
    application?.display_status === "Disbursed" && styles.statusHeaderDisbursed,
    application?.display_status === "Application At Bank" && styles.statusHeaderBank,
    application?.display_status === "Sanctioned" && styles.statusHeaderSanctioned,
  ]}>
        <Text style={{ color: 'white' }}>
        { application?.display_status === "Disbursed" ? "Application Disbursed" :
    application?.display_status === "Application At Bank" ? "Application At Bank" :
    application?.display_status === "Sanctioned" ? "Application sanctioned" :
    application?.display_status
    }
          </Text>
        <Text style={{ color: 'white' }}>{application?.updated_at}</Text>
      </View>

      {/* Tabs */}
      <MaterialTopTabs>
        <MaterialTopTabs.Screen name="index"
         options={{
          title:"Details",
          tabBarLabel: ({ focused, color }) => (
            <Text style={{color: focused ? "#007BFF" : color,textTransform: "none" }}>Details</Text>
          ),
        }} 
         />
        <MaterialTopTabs.Screen name="documents" options={{
          
           title: "Documents" ,
           tabBarLabel: ({ focused, color }) => (
            <Text style={{ color: focused ? "#007BFF" : color,textTransform: "none" }}>Documents</Text>
          ),}} />
        <MaterialTopTabs.Screen name="updates" 
         options={{ 
          title: "Updates",
          tabBarLabel: ({ focused, color }) => (
            <Text style={{color: focused ? "#007BFF" : color, textTransform: "none" }}>Updates</Text>
          ), }} />
      </MaterialTopTabs>

      <DeletModal
      visible={isModalVisible}
      onClose={handleCloseModal}
      onSubmit={handleSubmit}
       />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  headerDetails: {
    marginLeft: 10,
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
    color: '#494B4D',
  },
  statusHeaderDisbursed:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#67b675',
  },
  statusHeaderBank:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#246475',
  },
  statusHeaderSanctioned:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#dea22d',
  },
});
