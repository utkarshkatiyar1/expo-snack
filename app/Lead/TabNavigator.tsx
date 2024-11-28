import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import PersonalDetails from './Screens/PersonalDetails';
import EmploymentAndIncome from './Screens/EmploymentAndIncome';
import EducationDetails from './Screens/EducationDetails';

export type RootStackParamList = {
  PersonalDetails: undefined;
  EmploymentAndIncome: undefined;
  EducationDetails: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const tabs = [
    { id: 0, label: 'Personal Details', screen: 'PersonalDetails' },
    { id: 1, label: 'Employment & Income', screen: 'EmploymentAndIncome' },
    { id: 2, label: 'Education Details', screen: 'EducationDetails' },
  ];

  return (
    <NavigationContainer independent={true}>
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <View key={tab.id} style={styles.tabWrapper}>
              {index > 0 && (
                <View
                  style={[
                    styles.line,
                    activeStep === index ? styles.activeLine : styles.inactiveLine,
                  ]}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeStep === index ? styles.activeTab : styles.inactiveTab,
                ]}
                onPress={() => setActiveStep(index)}
              >
                <Text style={activeStep === index ? styles.activeText : styles.inactiveText}>
                  {index + 1}. {tab.label}
                </Text>
              </TouchableOpacity>

              {index < tabs.length - 1 && (
                <View
                  style={[
                    styles.line,
                    activeStep === index ? styles.activeLine : styles.inactiveLine,
                  ]}
                />
              )}
            </View>
          ))}
        </ScrollView>

        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {activeStep === 0 && <Stack.Screen name="PersonalDetails" component={PersonalDetails} />}
          {activeStep === 1 && (
            <Stack.Screen name="EmploymentAndIncome" component={EmploymentAndIncome} />
          )}
          {activeStep === 2 && (
            <Stack.Screen name="EducationDetails" component={EducationDetails} />
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 10,
    maxHeight: 40,
    
  },
  tabWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight:40,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  inactiveTab: {
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
  },
  activeText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inactiveText: {
    color: '#A3A3A3',
    fontSize: 14,
  },
  line: {
    height: 2,
    width: 15,
  },
  activeLine: {
    backgroundColor: '#007AFF',
  },
  inactiveLine: {
    backgroundColor: '#D9D9D9',
  },
});

export default TabNavigator;
