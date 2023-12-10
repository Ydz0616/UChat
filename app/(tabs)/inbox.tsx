import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, Button, Pressable, Modal, Alert, Platform } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, query, where, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { CreateChat } from '../../components/Find';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TabOneScreen() {
  const [modalText, setModalText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([])
  const firstLoad = useRef(true)
  const user = FIREBASE_AUTH.currentUser;

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const schedulePushNotification = async (title:string, body:string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: 60 * 15 }, // wait 15 minutes
    });
  }

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId: 'd2626dc3-9874-4f52-bb58-e3b7ad6dd6bc' })).data;
        console.log('TOKEN:', token);
      } else {
        alert('Must use physical device for Push Notifications');
      }

      return token;
    }

    registerForPushNotificationsAsync().then(token => console.log('TOKEN:', token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('NOTIFICATION:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('RESPONSE:', response);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const fetchData = async () => {
    setUserNotifications([])
    try {
      const notificationsRef = collection(FIREBASE_DB, 'notifications');
      const queryRef = query(notificationsRef, where('receiver', '==', user!.uid));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        let updatedNotifications: any[] = [];

        querySnapshot.forEach((doc) => {
          const request = doc.data() as any; // Type assertion
          if (request?.status === 'pending') {
            console.log('Req:', request)
            updatedNotifications.push(request);
          }
        });

        if (!firstLoad.current && updatedNotifications.length !== 0) {
          schedulePushNotification('It\'s time to break the ice!! ❄️', 'Hey, you left something in your inbox. Ready to check?')
        } else if (updatedNotifications.length === 0) {
          Notifications.cancelAllScheduledNotificationsAsync()
        }
        firstLoad.current = false
        setUserNotifications(updatedNotifications);
      });
      return () => {
        // Unsubscribe from the snapshot listener when component unmounts
        eventlistener();
      };
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchData();
  }, []);



  const handleUserInfoRequest = async (senderUid: string) => {
    const querySnapshot = await getDocs(
      query(collection(FIREBASE_DB, 'users'), where('uid', '==', senderUid))
    );
    const senderInfo = querySnapshot.docs[0].data()
    const senderHobbies = (senderInfo?.hobbies as string[]) ?? []
    setModalText(`Class Year: ${senderInfo?.classYear ?? 'not given'} \n\n Major: ${senderInfo?.major ?? 'not given'} \n\n Hobbies: ${senderHobbies.map(hobby => hobby.trim()).join(', ') ?? 'not given'}`)
    setModalVisible(!modalVisible)
  }

  const handleFriendRequestAction = async (senderUid: string, receiverUid: string, action: string) => {
    try {
      const querySnapshot = await getDocs(
        // TODO: consider ordering notifications by `timestamp` field
        query(collection(FIREBASE_DB, 'notifications'), where('sender', '==', senderUid), where('receiver', '==', receiverUid))
      );
      const existingDocRef = querySnapshot.docs[0].ref;
      // get the chatting status of both users 
      var chatStatus_sender = (await getDocs(query(collection(FIREBASE_DB, 'users'), where('uid', '==', senderUid)))).docs[0].data().chatting;
      console.log(chatStatus_sender);
      var chatStatus_receiver = (await getDocs(query(collection(FIREBASE_DB, 'users'), where('uid', '==', receiverUid)))).docs[0].data().chatting;
      if (action === 'accepted' && !chatStatus_receiver && !chatStatus_sender) {
        await CreateChat(senderUid)
        await updateDoc(existingDocRef, {
          type: 'friend-request',
          sender: senderUid,
          receiver: receiverUid,
          status: action,
          timestamp: serverTimestamp()
        });
        console.log(chatStatus_receiver, chatStatus_sender)
        Alert.alert('Great job, you just broke the ice!')
      }
      if (action === 'accepted' && chatStatus_receiver) {
        console.log(chatStatus_receiver, chatStatus_sender)
        Alert.alert('You are chatting with someone else now')
      }
      if (action === 'accepted' && chatStatus_sender) {
        console.log(chatStatus_receiver, chatStatus_sender)
        Alert.alert('The sender is chatting with someone else now')
      }
      if (action === 'rejected') {
        await updateDoc(existingDocRef, {
          type: 'friend-request',
          sender: senderUid,
          receiver: receiverUid,
          status: action,
          timestamp: serverTimestamp()
        });
        console.log(chatStatus_receiver, chatStatus_sender)
        Alert.alert('Rejected friend request')
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <View style={styles.container}>
        {/* TODO: display user info in dialog */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => { setModalVisible(!modalVisible) }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{modalText}</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {userNotifications.length > 0 ?
          <FlatList
            data={userNotifications}
            keyExtractor={item => item?.type + item?.receiver + item?.sender}
            renderItem={({ item }) => (
              <View style={styles.resultContainer}>
                {/* TODO: account for other notification types */}
                {item.type === 'friend-request' ?
                  <>
                    <Text style={styles.header}>You have a friend request!</Text>
                    <Text style={styles.message}>Ready to break the ice with <Text style={styles.messageHighlight}>{item.sender}</Text>?</Text>
                    <Pressable onPress={() => handleUserInfoRequest(item.sender)}>
                      <Text style={styles.ref}>Click here to learn more about user</Text>
                    </Pressable>
                    <View style={styles.btngroup}>
                      <Button title='Accept' onPress={() => handleFriendRequestAction(item.sender, item.receiver, 'accepted')} />
                      <Button title='Reject' onPress={() => handleFriendRequestAction(item.sender, item.receiver, 'rejected')} />
                    </View>

                  </>

                  : <Text>Not Currently Handled</Text>}
              </View>
            )}
          />
          : <Text style={styles.modalText}>No notifications</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  resultContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 18, // Set the font size to make the name larger
    color: '#c2e0fc', // Set the color to blue
    fontWeight: 'bold', // Optionally, you can make the text bold
    fontStyle: 'italic',
  },
  // 2 below text elements are for modal
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  message: {
    fontSize: 16,
  },
  messageHighlight: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007BFF',
  },
  ref: {
    fontSize: 14,
    color: 'gray',
  },
  btngroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
});
