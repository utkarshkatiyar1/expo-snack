import { leadsList } from '@/api/lead';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Modal, ActivityIndicator } from 'react-native';
import { LeadObject } from '@/utils/type';
import LeadCard from '../Lead/LeadCard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import EmptyLeads from '../EmptyLeads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from "react-native-toast-notifications";

const LoadingOverlay = ({ loading }: { loading: boolean }) => (
  <Modal transparent={true} visible={loading} animationType="fade">
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  </Modal>
);

export default function Tab() {
  const [leadsListData, setLeadsListData] = useState<LeadObject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<LeadObject[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisiting, setIsVisiting] = useState<boolean>(true); // Initial loading state
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const toaster = useToast(); // Get toaster instance

  const fetchLeads = async (query = '', pageNumber = 1) => {
    const token = await AsyncStorage.getItem('auth_token');
    console.log('Token', token);
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await leadsList(query, pageNumber,toaster);
      if (data?.data?.leads) {
        const newLeads = data.data.leads;
        if (newLeads.length === 0) {
          setHasMoreData(false);
        } else {
          setLeadsListData((prev) => [...prev, ...newLeads]);
          setFilteredLeads((prev) => [...prev, ...newLeads]);
        }
      }
    } catch (error) {
      console.log('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
      setIsVisiting(false); // Set to false after the first fetch completes
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPage(1);

    if (query.trim() === '') {
      try {
        const data = await leadsList('', 1,toaster);
        if (data?.data?.leads) {
          setLeadsListData(data.data.leads);
          setFilteredLeads(data.data.leads);
          setHasMoreData(true);
        }
      } catch (error) {
        console.log('Error fetching default leads:', error);
      }
    } else if (query.trim().length <= 3) {
      try {
        const data = await leadsList(query, 1,toaster);
        if (data?.data?.leads) {
          setLeadsListData(data.data.leads);
          setFilteredLeads(data.data.leads);
        }
      } catch (error) {
        console.log('Error fetching leads for short query:', error);
      }
    } else {
      try {
        const data = await leadsList(query.trim(), 1,toaster);
        if (data?.data?.leads) {
          setFilteredLeads(data.data.leads);
          setLeadsListData(data.data.leads);
        }
      } catch (error) {
        console.log('Error fetching leads for search query:', error);
      }
    }
  };

  const loadMoreLeads = () => {
    if (hasMoreData && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLeads(searchQuery, nextPage);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setSearchQuery('');
      setLeadsListData([]);
      setFilteredLeads([]);
      setPage(1);
      setHasMoreData(true);
      setIsVisiting(true); // Reset initial loading
      fetchLeads();
    }, [])
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      <LoadingOverlay loading={isLoading} />

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#9e9e9e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search via LAN, Application ID or name"
          placeholderTextColor="#9e9e9e"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Conditional Rendering */}
      {isVisiting ? (
        <View style={styles.emptyContainer}>
          <EmptyLeads />
        </View>
      ) : filteredLeads.length > 0 ? (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item, index) => `${item.lead.id}-${index}`}
          renderItem={({ item }) => <LeadCard leadsListData={[item]} />}
          onEndReached={() => {
            if (filteredLeads.length >= 1) loadMoreLeads();
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={isLoading ? <ActivityIndicator size="large" color="black" /> : null}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 16, color: 'gray' }}>No leads found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
    margin: 15,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
