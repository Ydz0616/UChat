import React, { useState, useRef, useEffect } from 'react';
import EditScreenInfo from  '../components/EditScreenInfo';
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

const Message = (_uid:any) => {
  
  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const combinedID = currentUser?.uid! > _uid 
  ? currentUser?.uid + _uid 
  : _uid + currentUser?.uid;
  const flatListRef = useRef<FlatList | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const  [messages, setMessages] = useState()
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
