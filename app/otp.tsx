import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyOtpParams, verifyotp } from "@/api/login";
import Logo from "@/assets/svg/Logo";
import { useToast } from "react-native-toast-notifications";

const OtpScreen: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = Array.from({ length: 6 }, () => useRef<TextInput>(null));
  const { mobileNumber } = useLocalSearchParams();
  const router = useRouter();
  const toaster = useToast(); // Get toaster instance

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Enable/disable button based on OTP length
  useEffect(() => {
    setIsButtonDisabled(otp.includes(""));
  }, [otp]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to the next input if there's input and it's not the last one
    if (text && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (event: { nativeEvent: { key: string } }, index: number) => {
    if (event.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = ""; // Clear the previous box
      setOtp(newOtp);
    }
  };

  const handleButtonPress = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      const data: VerifyOtpParams = {
        mobileNumber: mobileNumber.toString(),
        otp: enteredOtp,
      };

      try {
        const verifiedData = await verifyotp(data, toaster); // Pass toaster instance to verifyotp function
        if (verifiedData.data.dsa.active) {
          
          router.replace("/"); // Redirect to the landing page
        } else {
          router.replace("/userDetails/userForm"); // Redirect to user form if not active
        }
      } catch (error) {
        toaster.show(
          <View style={styles.toastContainer}>
            <Logo width={20} height={20} style={styles.toastLogo} />
            <Text style={styles.toastText}>
              Failed to verify OTP. Please try again.
            </Text>
          </View>,
          { type: "error", duration: 3000 }
        );
      }
    } else {
      toaster.show(
        <View style={styles.toastContainer}>
          <Logo width={20} height={20} style={styles.toastLogo} />
          <Text style={styles.toastText}>
            Invalid OTP, Please enter a valid 6 digit OTP
          </Text>
        </View>,
        { type: "error", duration: 3000 }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Logo width={25} height={25} />
          <Text style={styles.logotitle}>LOAN NETWORK</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.title}>Enter the OTP sent on</Text>
        <Text style={styles.label}>{mobileNumber}</Text>
        <Text style={styles.otplabel}>OTP</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)} // Add onKeyPress handler
            />
          ))}
        </View>
      </View>

      <Text style={styles.label}>Facing Trouble?{' '}<Text style={styles.contactSupport}>Contact Support</Text></Text>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.disabledButton]}
          onPress={handleButtonPress}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    backgroundColor: "#F8F9FE",
  },
  topSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingTop: 50,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logotitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "400",
    color: "#808080",
    textAlign: "left",
  },
  otplabel: {
    paddingTop: 20,
    fontSize: 18,
    color: "#808080",
    textAlign: "left",
  },
  contactSupport: {
    color: '#007bff', 
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpInput: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 15,
    textAlign: "center",
    fontSize: 20,
    padding: 15,
    fontWeight: '500',
    width: 45,
    marginRight: 10,
  },
  bottomSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "grey",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toastLogo: {
    marginRight: 10,
  },
  toastText: {
    color: "#fff", // Dark red text for error
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OtpScreen;
