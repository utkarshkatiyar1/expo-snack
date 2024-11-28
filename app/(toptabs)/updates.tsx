import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const Details = () => {
  const { application, error } = useSelector((state: RootState) => state.application);
  console.log(application?.updates, "updates......");
  return (
    <FlatList
      data={application?.updates}
      keyExtractor={(item: any) => item.id.toString()}
      style={styles.main}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.title}>{item.display_status}</Text>
              <Text style={styles.subtitle}>
                {item.display_status === 'Application At Bank' && `Loan Amount: ${item.display_amount}`}
                {item.display_status === 'Sanctioned' && `Sanction Amount: ${item.display_amount}`}
                {item.display_status === 'Disbursed' && `Disbursement Amount: ${item.display_amount}`}
              </Text>
            </View>
            <View>
              <View style={{ flexDirection: 'column', alignItems:'center', justifyContent:'center' }}>
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={styles.time}>{item.display_created_at}</Text>
              </View>
            </View>
          </View>
          <View style={styles.dashedLine} />
        </View>
      )}
    />
  )
}

export default Details;

const styles = StyleSheet.create({
  card: {
    margin: 2,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginStart:4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12.5,
    color: 'gray',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center'

  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dashedLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: 5,
  },
  main: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
})