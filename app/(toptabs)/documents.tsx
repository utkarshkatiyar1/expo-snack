import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { setViewUrl } from '@/store/profile';


const Documents = () => {
  const { application, error } = useSelector((state: RootState) => state.application);
  const router = useRouter();

  const dispatch = useDispatch();
  const openImageViewer = (doc: string | null) => {
     dispatch(setViewUrl(doc || ""));
    router.push({
      pathname: "../../userDetails/ImageViewer",
      params: {
        doc: doc,
      },
    });
  };
  const handlePress = (item: any) => {
    // Define what happens when a card is pressed (e.g., navigate to a detail page, show a modal, etc.)
    const key=application?.documents.find(document => document.type === item.type)?.url || null;
    openImageViewer(key); 
    console.log('Card pressed:', item);
  };

  return (
    <FlatList
      data={application?.documents}
      keyExtractor={(item: any) => item.id.toString()}
      style={styles.main}
      renderItem={({ item }) => (

        <TouchableOpacity onPress={() => handlePress(item)}>
          <View style={styles.itemContainer}>
            <View style={styles.row}>
              <View style={{ marginRight: 20 }}>
                <FontAwesome5 name="images" size={35} color="#A9D792" />
              </View>
              <View style={{ display: "flex", flexDirection: "row",width:"80%", justifyContent:"space-between"}}>

                <View style={styles.column}>
                  <Text style={styles.displayName}>{item.display_name}</Text>
                  <Text style={styles.createdAt}>{item.created_at}</Text>
                </View>


                <View style={{display:"flex",flexDirection:"row", alignItems:"center", justifyContent:"space-between",width:"20%"}}>
                  <AntDesign name="delete" size={12} color="red" />
                  <AntDesign name="right" size={14} color="blue" />
                </View>



            </View>

          </View>
          </View>
          <View style={styles.dashedLine} />
        </TouchableOpacity>

      )}
    />
  );
};

export default Documents;

const styles = StyleSheet.create({
  // card: {
  //   borderRadius: 8,
  //   backgroundColor: '#fff',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 3, // Adds a shadow for Android
  //   margin: 8,
  // },
  itemContainer: {
    padding: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    justifyContent: 'space-between',
  },
  displayName: {
    fontSize: 16.5,
    fontWeight: '500',
  },
  createdAt: {
    fontSize: 12.5,
    color: 'gray',
    marginTop: 5,
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: '',
    // marginHorizontal: 2,
    marginVertical: 4,
    alignItems: "center"
  },
  main: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  dashedLine: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical:5
  },
});
