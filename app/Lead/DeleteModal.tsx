import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';


export default function DeletModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const options = ['In House', 'My DSA'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
           <View style={styles.modalOverlay}>
         
        <View style={styles.modalContent}>

          {/* Title */}
          <View style={{borderBottomWidth:1 ,borderColor:"#f0f0f0",flexDirection:"row",justifyContent:"flex-start",alignItems:"center",marginTop:10,paddingBottom:15,}}>
            <AntDesign name="delete" size={15} color="red" />
             <Text style={styles.modalTitle}>Delete Lead</Text>
          </View>

          {/* Options */}
          <View style={{}}>
            <Text style={{fontSize:18,fontWeight:"400", color:"#393D47",paddingBottom:10,paddingTop:10}}>
              Once the Lead is deleted all its applications will also be deleted
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={onSubmit}
            >
              <Text style={styles.nextButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  handle: {
    width: 100,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color : "gray",
    textAlign: 'left',
    
    marginLeft: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    borderColor: '#007bff',
    borderWidth: 7,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'grey',
    
    borderRadius: 20,
    paddingVertical: 10,
    marginRight: 5,
    alignItems: 'center',
    backgroundColor: "grey",
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: 'red',
    borderRadius: 20,
    paddingVertical: 10,
    marginLeft: 5,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
