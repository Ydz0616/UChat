import React, { useState, useRef, useEffect } from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_APP } from '../firebaseConfig';
import { updateDoc, doc,arrayUnion, setDoc, addDoc ,getDoc, collection, serverTimestamp, onSnapshot, Timestamp } from '@firebase/firestore';

const Message = () => {
  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  
  const  [messages, setMessages] = useState([{id:null, text:null, sender_id:null}])
  // this is a static test example, we'll inpelement real examples
  // after the notification system is done
  var uid = 'e0lkvGkocPUPJCvWbeZiq8SCv2o1' // Yuandong
  if ( currentUser?.uid == uid) {
    uid = '2Hth0GlLU0a6h0asCgJ550lZgBG2' // Jordan
  }
  const combinedID = currentUser?.uid! > uid 
  ? currentUser?.uid + uid 
  : uid + currentUser?.uid;
  const flatListRef = useRef<FlatList | null>(null);
  
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", combinedID), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [combinedID]);
  const handleSendMessage = async() => {
    if (newMessage.trim() === '') {
      return;
    }
    if(currentUser?.uid){
      try{
        const combinedID = currentUser?.uid> uid 
          ? currentUser?.uid + uid 
          : uid + currentUser?.uid;
        const newMessageObj = { id: Timestamp.now(), text: newMessage, sender_id:currentUser?.uid};
        await updateDoc(doc(db,'chats',combinedID),{
          messages:arrayUnion(newMessageObj)
        });
        
        setNewMessage('');
      }catch(error){
        console.log(error);
      }
    
    }
    // Scroll to the bottom of the chat when a new message is sent
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd();
    }
  };







  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <View style={styles.userHeader}>
        {/* write a button with the selectuser event */}  
      {/* <Image source={userAvatar} style={styles.avatar} /> */}
      {/* <Text style={styles.userName}>{userName}</Text> */}
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
  );
};


const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
});

export default Message;
