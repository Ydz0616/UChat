import { FlatList, KeyboardAvoidingView, SafeAreaView, StyleSheet,Image } from 'react-native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View , TextInput} from '../../components/Themed';
import Message from '../../components/Message';
import React, { useState,useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDoc,query, where, serverTimestamp, updateDoc, onSnapshot,doc, getDocs, Timestamp, arrayUnion} from 'firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfilePicture, { defaultProfilePictureURL } from '../../components/ProfilePicture';
export default function TabTwoScreen() {


  const flatListRef = useRef<FlatList | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const  [messages, setMessages] = useState()
  const [showChat, setShowChat] = useState(false);
  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const [combinedID, setCombinedID] = useState('' as any)
  const [avatar, setAvatar] = useState('' as any) 
  const [name, setName] = useState('' as any) 
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
    setName(querySnapshot.docs[0].data().username)
    setAvatar(querySnapshot.docs[0].data().profilepic)
    
  }


  // Define a function to handle the button click and show the ChatPage
  const handleAcceptRequest = () => {
    //TODO:  navigate to the search page
    console.log('navigating')
    // Please COMMENT BELOW when implemented the navigation
    setShowChat(true)
  };


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
    const MyComponent: React.FC = () => {
      return (
        <View>
          <Image
            source={{ uri: 'https://example.com/path-to-your-image.jpg' }}
            style={{ width: 100, height: 100 }} // You can adjust the width and height
          />
        </View>
      );
    };
    }
  
  return (
    <View style={styles.container}>
      {showChat ? (
        <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{name}</Text>
        </View>
          {/* <ProfilePicture profilePicture={avatar}/> */}
          {/* User name */}
          
          {/* Icon on the right */}
          <TouchableOpacity style={styles.iconContainer}>
          <Icon name="ellipsis-h" size={24} color="black" /> {/* Three dots icon */}
        </TouchableOpacity>
        </View>
        <FlatList
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
            <Text style={styles.sendButton}>Send</Text>
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
          <TouchableOpacity onPress={handleAcceptRequest} style={styles.button}>
            <Text style={styles.buttonText}>Find A Friend</Text>
          
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    
  
  userHeader: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Adjust alignment as needed
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
    marginBottom: 5, // Add spacing between avatar and name
  },
  iconContainer: {
    // Style your icon container here
    padding: 10, // Adjust the padding as needed
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
