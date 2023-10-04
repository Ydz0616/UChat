import React, { useState, useRef, useEffect } from 'react';
import { selectUser} from './getUser';
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
import { updateDoc, doc, where,setDoc, addDoc ,getDoc, collection, serverTimestamp, onSnapshot } from '@firebase/firestore';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello!', isUser: false },
    { id: '2', text: 'Hi there!', isUser: true },
    { id: '3', text: 'This is a sample message from the user.', isUser: true },
  ]);

  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  // this is a static test example, we'll inpelement real examples
  // after the notification system is done
  const uid = 'e0lkvGkocPUPJCvWbeZiq8SCv2o1'
  const flatListRef = useRef<FlatList | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const fetchMessages = () => {
    
    if (!currentUser?.uid) return; // No user UID, do nothing

    const chatDocRef = doc(db, 'userchats', currentUser?.uid);

    return onSnapshot(chatDocRef, (snapshot) => {
      
      //TODO: need another layer of logic to see if the user have any chats
      if (snapshot.exists()) {
        const data = snapshot.data();
        const newMessages = data?.messages || [];
        setMessages(newMessages);
        console.log('new messages', newMessages);
      }
      else {
        console.log('No messages');
        
      }
      
      
    }); 
  };
  const handleSendMessage = () => {
    if (newMessage.trim() === '') {
      return;
    }
    
    const newMessageObj = { id: String(Date.now()), text: newMessage, uid: uid, isUser: currentUser?.uid };

    setNewMessage('');

    // Scroll to the bottom of the chat when a new message is sent
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd();
    }
  };







  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <View style={styles.userHeader}>     
      {/* <Image source={userAvatar} style={styles.avatar} /> */}
      {/* <Text style={styles.userName}>{userName}</Text> */}
    </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({item }) => (
          <View
            style={[
              styles.messageContainer,
              {
                backgroundColor: item.isUser ? '#007BFF' : '#E5E5EA',
                alignSelf: item.isUser ? 'flex-end' : 'flex-start',
                marginLeft: item.isUser ? 90 : 10,
                marginRight: item.isUser ? 10 : 90,
              },
            ]}
          >
            <Text style={{ color: item.isUser ? 'white' : 'black' }}>{item.text}</Text>
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

      <KeyboardAvoidingView behavior= 'padding' style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Text style={styles.sendButton}>Send</Text>
        </TouchableOpacity>
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

export default ChatPage;
