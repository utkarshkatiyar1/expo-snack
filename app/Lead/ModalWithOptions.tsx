import React, { useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, Button, StyleSheet } from 'react-native';


export default function ModalWithOptions({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedOption: string) => void;
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
          {/* Handle for Bottom Sheet */}
          <View style={styles.handle} />
        <View style={styles.modalContent}>

          {/* Title */}
          <Text style={styles.modalTitle}>Select type of lead</Text>

          {/* Options */}
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.option}>
                <Text style={styles.optionText}>{item}</Text>
                <TouchableOpacity onPress={() => setSelectedOption(item)}>
                <View
                  style={[
                    styles.radioButton,
                    selectedOption === item && styles.radioButtonSelected,
                  ]}
                />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => onSubmit(selectedOption)}
            >
              <Text style={styles.nextButtonText}>Next</Text>
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
    paddingBottom: 40,
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
    marginTop: 20,
    textAlign: 'left',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginVertical: 15,
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
    borderColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    marginRight: 5,
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  cancelButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007bff',
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
