import { StyleSheet } from 'react-native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import Message from '../../components/Message';
import React, { useState,useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, query, where, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function TabTwoScreen() {
  const [showChat, setShowChat] = useState(false);
  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const fetchData = async () => {
    
    try {
      console.log('running')
      const notificationsRef = collection(FIREBASE_DB, 'chats');
      // the queryRef should be the doc that the current user is in the users array and the chatting is ture
      const queryRef = query(notificationsRef, where('users', 'array-contains', currentUser?.uid),where('chatting','==',true));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log('the data of the doc',doc.data())
          setShowChat(true);
        })
        if(querySnapshot.empty){
          console.log('empty')  
        }
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

  // Define a function to handle the button click and show the ChatPage
  const handleAcceptRequest = () => {
    //TODO:  navigate to the search page
    console.log('navigating')
    // Please COMMENT BELOW when implemented the navigation
    setShowChat(true)


   
  };

  return (
    <View style={styles.container}>
      {showChat ? (
        <Message />
      ) : (
        <View>
          <Text style={styles.messageText}>
            Oops~ Looks Like You Don't Have a Chat Yet.
          </Text>    
          {/* <View> <GetUser></GetUser></View> */}
          <TouchableOpacity onPress={handleAcceptRequest} style={styles.button}>
            <Text style={styles.buttonText}>Find A Friend</Text>
          
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    lineHeight: 30,
  },
  senderText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
