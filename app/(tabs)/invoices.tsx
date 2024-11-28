import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons'

const invoices = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.item,styles.backGround]}>
      <FontAwesome6 name="receipt" size={35} color="black"  />
      </View>
      <View style={styles.item}>
      <Text style={{fontWeight:500,fontSize:18}} >Good things take time</Text>
      </View>
      <View style={styles.item}>
      <Text style={{color:"grey"}}>All invoices generated will be appear here</Text>
      </View>
    </View>
  )
}

export default invoices

const styles = StyleSheet.create({
  emptyContainer: {
    flex:1, flexDirection:"column",justifyContent:"center",alignItems:"center",
    backgroundColor:"voilet"
  },
  item:{
    padding:6,
  },
  backGround:{
    backgroundColor:"white"
  }

})