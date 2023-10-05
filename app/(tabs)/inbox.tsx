import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Button, Pressable, Modal } from 'react-native';
import { Text, View } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, query, where, serverTimestamp, updateDoc } from 'firebase/firestore';

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
    color: '#c2e0fc',
    fontWeight: 'bold'
  },
  message: {
    fontSize: 16,
    color: 'white',
  },
  underline: {
    fontSize: 14,
    color: 'white',
    textDecorationLine: 'underline',
  },
  btn: {
    width: 50,
  },
  btngroup: {
    flex: 1,
    flexBasis: 1 / 2,
  },
});

export default function TabOneScreen() {
  const [modalText, setModalText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [userNotifications, setUserNotifications] = useState<any[]>([])
  const user = FIREBASE_AUTH.currentUser;

  const fetchData = async () => {
    setUserNotifications([])
    try {
      // Fetch their notifications
      const requestQuerySnapshot = await getDocs(
        query(collection(FIREBASE_DB, 'notifications'), where('receiver', '==', user!.uid))
      );
      requestQuerySnapshot.forEach((doc) => {
        const request = doc.data();
        if (request?.status === 'pending') {
          setUserNotifications([...userNotifications, request]);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserInfoRequest = async (senderUid: string) => {
    // TODO: display user info in dialog
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
      await updateDoc(existingDocRef, {
        type: 'friend-request',
        sender: senderUid,
        receiver: receiverUid,
        status: action,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error(error)
    }
  }

  return (
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

      <FlatList
        data={userNotifications}
        renderItem={({ item }) => (
          <View style={styles.resultContainer}>
            {/* TODO: account for other notification types */}
            {item.type === 'friend-request' ?
              <>
                <Text style={styles.header}> You have a friend request</Text>
                <Text style={styles.message}> {'From ' + item.sender} </Text>
                <Pressable onPress={() => handleUserInfoRequest(item.sender)}>
                  <Text style={styles.underline}> Learn More About User </Text>
                </Pressable>
                <View style={styles.btngroup}>
                  <Button title='Accept' onPress={() => handleFriendRequestAction(item.sender, item.receiver, 'accepted')} />
                  <Button title='Reject' onPress={() => handleFriendRequestAction(item.sender, item.receiver, 'rejected')} />
                </View>

              </>

              : <Text>Not Currently Handled</Text>}
          </View>
        )}
        keyExtractor={item => item.uid}
      />
    </View>
  );
}
