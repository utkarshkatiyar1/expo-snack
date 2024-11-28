import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchNotifications } from "@/api/fetchNotifications";
import { NotificationsParams } from "@/utils/type";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { fetchApplicationFailure, fetchApplicationStart, fetchApplicationSuccess } from "@/store/applicationSlice";
import { applicationDetails } from "@/api/lead";
import { useToast } from "react-native-toast-notifications";
const NotificationScreen = () => {
   const router=useRouter();
   const toaster = useToast(); // Get toaster instance

   const dispatch=useDispatch();
  const [notifications, setNotifications] = useState<NotificationsParams[]>([]);
  const handleClick = async(item: NotificationsParams) => {
    console.log("clicked",item);
   
      dispatch(fetchApplicationStart());
      try {
        const response = await applicationDetails(item?.payload?.application_id.toString(), toaster); // replace with your API call
        dispatch(fetchApplicationSuccess(response.data.application));  
      }
      catch (err : any) {
        dispatch(fetchApplicationFailure(err.message));
      }
      finally
      {
        router.push({
          pathname:"/Lead/Disbursements/details",
          params:{iddis:item?.payload?.disbursement_id.toString()}
        });
      }
   
  }
  useEffect(() => {
    const loadNotifications = async () => {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }

      const fetchedNotifications = await fetchNotifications();
      setNotifications(fetchedNotifications);
    };

    loadNotifications();
  }, []);

  const renderItem = ({ item }: { item: NotificationsParams }) => (
    <Pressable onPress={() => handleClick(item) }>
    <View style={[styles.card, { borderLeftColor: item.colour }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.colour }]}>
          <Text style={styles.icon}>
            {item.type === "error" ? "X" : item.type === "warning" ? "!" : "✓"}
          </Text>
        </View>
        <View style={styles.headerTextContainer}>
          <View style={styles.titleDateRow}>
            <Text style={[styles.title, { color: item.colour }]}>
              {item.title}
            </Text>
            <Text style={styles.date}>{`on ${item.display_date}`}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.description}>{item.body}</Text>
    </View>
    </Pressable>
  );

  return (
    <View style={{backgroundColor:"#F8F9FE",height:"100%"}}>
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  listContainer: {
    
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#F8F9FE",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerTextContainer: {
    flex: 1,
    // marginTop: 10,
  },
  titleDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    color: "",
    fontWeight: "black",
    flexShrink: 1, // Allows title to shrink if needed
    marginTop: 3,
  },
  date: {
    fontSize: 14,
    color: "#777777",
  },
  description: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
  },
});
