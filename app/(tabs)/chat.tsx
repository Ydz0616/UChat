import { FlatList, KeyboardAvoidingView, SafeAreaView, StyleSheet,Image } from 'react-native';
import { Text, View , TextInput} from '../../components/Themed';
import React, { useState,useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH ,FIREBASE_RTDB} from '../../firebaseConfig';
import { collection, query, where,  updateDoc, setDoc,onSnapshot,doc, getDocs, Timestamp, arrayUnion,serverTimestamp as serverTimestampFirestore} from 'firebase/firestore';
import { onDisconnect, ref, serverTimestamp, set,onValue} from "firebase/database";
import Icon from '@expo/vector-icons/FontAwesome';
export default function TabTwoScreen() {
  const flatListRef = useRef<FlatList | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const  [messages, setMessages] = useState([] as any[])
  const [showChat, setShowChat] = useState(false);
  const [combinedID, setCombinedID] = useState('' as any)
  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const uid = currentUser?.uid;
  const realtimeDatabase = FIREBASE_RTDB;
  const userStatusDatabaseRef = ref(realtimeDatabase, `/status/${uid}`);
  const userStatusFirestoreRef = doc(db, 'status', uid!);
  const isOfflineForDatabase = {
    state: 'offline',
    last_changed: serverTimestamp(),
  };
  const isOnlineForDatabase = {
    state: 'online',
    last_changed: serverTimestamp(),
  };
  
// Firestore uses a different server timestamp value, so we'll 
// create two more constants for Firestore state.
  const isOfflineForFirestore = {
    state: 'offline',
    last_changed: serverTimestampFirestore(),
  };

  const isOnlineForFirestore = {
    state: 'online',
    last_changed: serverTimestampFirestore(),
  };

  const connectedRef = ref(realtimeDatabase, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      setDoc(userStatusFirestoreRef, isOfflineForFirestore);
      console.log('offline')
      return;
    }
    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
      set(userStatusDatabaseRef, isOnlineForDatabase);
      setDoc(userStatusFirestoreRef, isOnlineForFirestore);
    }
    );
  });

  const statusCollectionRef = collection(db, 'status');

  const onlineStatusQuery = query(statusCollectionRef, where('state', '==', 'online'));
  
  onSnapshot(onlineStatusQuery, (snapshot) => {
    snapshot.docChanges().forEach(function(change){
      if(change.type === 'added'){
        console.log('added')
      }
      if(change.type === 'modified'){
        console.log('modified')
      }
      if(change.type === 'removed'){
        console.log('removed')
      }
    })
  });
  const fetchData = async () => {
  var uid = null
    try {
      console.log('running')
      const notificationsRef = collection(FIREBASE_DB, 'chats');
      // the queryRef should be the doc that the current user is in the users array and the chatting is ture
      const queryRef = query(notificationsRef, where('users', 'array-contains', currentUser?.uid),where('chatting','==',true));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
           var chatData = doc.data();
           console.log(chatData)
            if(chatData.users[0] == currentUser?.uid){
              // get the user data from the second user from users collection where the uid is the second user
              uid = chatData.users[1]
            }
            if(chatData.users[1] == currentUser?.uid){
              // get the user data from the second user from users collection where the uid is the second user
              uid = chatData.users[0]
            }
            const combinedID = currentUser?.uid! > uid! 
            ? currentUser?.uid + uid!
            : uid! + currentUser?.uid;
            setCombinedID(combinedID)
            getUserData(uid!)
            setMessages(chatData.messages)
            setShowChat(true)
        })
        if(querySnapshot.empty){
          console.log('empty') 
          setShowChat(false)

          return
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



  const getUserData = async (uid:any) =>{
    const querySnapshot = await getDocs(
      query(collection(FIREBASE_DB, 'users'), where('uid', '==', uid))
    );
    console.log(querySnapshot.docs[0].data())
  }

  const handleSendMessage = async() => {
    if (newMessage.trim() === '') {
      return;
    }
    if(currentUser?.uid){
      try{
        const newMessageObj = { id: Timestamp.now(), text: newMessage, sender_id:currentUser?.uid};
        await updateDoc(doc(db,'chats',combinedID),{
          messages:arrayUnion(newMessageObj)
        });
        setNewMessage('');
      }catch(error){
        console.log(error);
      }
    }

    }
  
  return (
    <View style={styles.container}>
      {showChat ? (
        <SafeAreaView style={{ flex: 1 }}>
          
        <FlatList style={{ marginTop: 20}} 
          data={messages}
          // keyExtractor={(item) => item.id}
          renderItem={({item }) => (
            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor: item.sender_id == currentUser?.uid? '#007BFF' : '#E5E5EA',
                  alignSelf: item.sender_id ==currentUser?.uid? 'flex-end' : 'flex-start',
                  marginLeft: item.sender_id ==currentUser?.uid? 90 : 10,
                  marginRight: item.sender_id ==currentUser?.uid? 10 : 90,
                },
              ]}
            >
              <Text style={{ color: item.sender_id ==currentUser?.uid? 'white' : 'black' }}>{item.text}</Text>
            </View>
          )}
          ref={(ref) => {
            flatListRef.current = ref;
          }}
          onContentSizeChange={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd();
            }
          }}
          
        />
        
        <KeyboardAvoidingView behavior= 'padding' keyboardVerticalOffset={100}  style={styles.inputContainer}>
          <View style = {styles.inputContainer}>
          <TextInput
            style={styles.input}
            
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={(text) => setNewMessage(text)}
          />
          <TouchableOpacity onPress={handleSendMessage}>
            <Icon name="send" size={24} color="#007BFF" style={styles.sendButton} ></Icon>
          </TouchableOpacity>
          </View>
          
        </KeyboardAvoidingView>
      </SafeAreaView>
   
      ) : (
        <View>
          <Text style={styles.messageText}>
            Oops~ Looks Like You Don't Have a Chat Yet.
          </Text>    
          {/* <View> <GetUser></GetUser></View> */}

        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  avatarContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  iconContainer: {
    padding: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row', // Added for avatar placement
    alignItems: 'center', // Added for avatar placement
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  sendButton: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
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
