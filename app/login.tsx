import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '@/assets/svg/Logo';
import {getOtp} from '@/api/login';
import { useToast } from 'react-native-toast-notifications';

const LoginScreen: React.FC = () => {
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [otp,setOtp]=useState<string>('');
  const [disabled,setDisabled]=useState<boolean>(true);
  const router = useRouter();
  const toaster =useToast();

  const handleGetOtp = async() => {
    // write code for api call to get otp through axios

    if (mobileNumber.length === 10) {
      const message=await getOtp(mobileNumber, toaster);
       setOtp(message.data.message);
       setDisabled(false);
      //  alert(`${message.data.message}`)
      toaster.show(message.data.message, {
        type: 'error',
      });
      router.push({
        pathname: '/otp',
        params: { mobileNumber }, // Passing mobileNumber to OTP page
      });
    } else {

      alert('Please enter a valid 10-digit mobile number.');
    }
  };
  useEffect(() => {
    setDisabled(mobileNumber.length !== 10);
  }, [mobileNumber]);


  return (
    <View style={styles.container}>
      {/* First section: Logo and "Loan Network" */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Logo width={35} height={35} />
          <Text style={styles.logotitle}>LOAN NETWORK</Text>
        </View>
      </View>

      {/* Second section: "Enter Mobile Number" */}
      <View style={styles.middleSection}>

        {/* <View style={styles.middleContainer}> */}
        <Text style={styles.title}>Please enter your phone number to continue</Text>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          // placeholder="Mobile Number"
        />
      </View>

      {/* Third section: "Get OTP" Button */}
      <View style={styles.bottomSection}>
        <Text style={styles.label}>Facing Trouble? Contact Support</Text>
        <TouchableOpacity style={[styles.button, disabled&& styles.disabledButton]}  disabled={disabled}onPress={handleGetOtp}>
          <Text style={styles.buttonText}>Get OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between', 
    backgroundColor:"#F4F6FF"// Evenly space out the sections vertically
  },
  topSection: {
    flex: 0, // Fixed height
    alignItems: 'center',
    justifyContent: 'flex-start', // Keep it at the top
    paddingVertical: 20, // Optional padding for spacing
    paddingTop: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleSection: {
    flex: 1, // Take up the remaining space
    justifyContent: 'center', // Center content vertically in the middle
    alignItems: 'flex-start', // Align content to the left
   // Optional margin for spacing
  },
  bottomSection: {
    flex: 0, // Fixed height
    justifyContent: 'flex-end', // Push content to the bottom
    alignItems: 'center',
    paddingVertical: 20, // Optional padding for spacing
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginBottom: 10,
  },
  logotitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    color: '#808080',
    marginVertical: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 15,
    fontSize: 20,
    fontWeight: "500",
    width: '100%',

  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    width: '100%', // Full-width button
    alignItems: 'center',
  },
  disabledButton:{
    backgroundColor: 'grey',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    width: '100%', // Full-width button
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
