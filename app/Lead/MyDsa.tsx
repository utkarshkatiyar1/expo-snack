import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

const MyDsa = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      try {
        // Logic for DSA Fetching
      } catch (error) {
        console.log('Error fetching default leads:', error);
      }
    } else {
      try {
        // Logic For Search
      } catch (error) {
        console.log('Error fetching leads for search query:', error);
      }
    }
  };
  return (
    <>
    <View style={styles.stickyContainer}>
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color="#9e9e9e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor="#9e9e9e"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.text}>
        <Text>No DSA Found</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonCancel}>
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      </>
  )
}

export default MyDsa

const styles = StyleSheet.create({
  stickyContainer: {
    // backgroundColor: '#fff',
    // padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fe',
    // marginTop: 10
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    margin: 15,
    // borderWidth: 1.5,
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
  text: {
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize: 14,
    color: '#000',
  },
  scrollContent:{
    // padding:2,
    paddingVertical:250,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    alignContent:"center",
    // borderWidth:2
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff", // Add background color for visibility
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
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
  buttonNext: {
    flex: 1,
    backgroundColor: "#007AFF", // Green for Next
    padding: 10,
    marginLeft: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#007AFF", // Set the text color to #007AFF
    textAlign: "center",
    fontWeight: "bold",
  },
})