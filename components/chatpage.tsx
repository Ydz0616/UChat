import React, { useState, useRef } from 'react';
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

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello!', isUser: false },
    { id: '2', text: 'Hi there!', isUser: true },
    { id: '3', text: 'This is a sample message from the user.', isUser: true },
    { id: '4', text: 'And here is a sample reply from the chatbot.', isUser: false },
    // Add more sample messages as needed
  ]);
  const userAvatar = require('../assets/images/favicon.png'); // Replace with the actual path to the user's avatar
  const userName = 'John Doe'; // Replace with the user's name
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList | null>(null);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') {
      return;
    }

    const newMessageObj = { id: String(Date.now()), text: newMessage, isUser: true };

    setMessages([...messages, newMessageObj]);
    setNewMessage('');

    // Scroll to the bottom of the chat when a new message is sent
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.userHeader}>
      <Image source={userAvatar} style={styles.avatar} />
      <Text style={styles.userName}>{userName}</Text>
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
