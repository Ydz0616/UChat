import { StyleSheet } from 'react-native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import ChatPage from '../../components/chatpage';

import React, { useState } from 'react';

import { TouchableOpacity } from 'react-native';


export default function TabTwoScreen() {
  const [showChat, setShowChat] = useState(false);

  // Define a function to handle the button click and show the ChatPage
  const handleAcceptRequest = () => {
    setShowChat(true);
  };

  return (
    <View style={styles.container}>
      {showChat ? (
        <ChatPage />
      ) : (
        <View>
          <Text style={styles.messageText}>
            You received a friend request from{' '}
            <Text style={styles.senderText}>Crazy Giraffe</Text>. Do you want to accept it?
          </Text>
          <TouchableOpacity onPress={handleAcceptRequest} style={styles.button}>
            <Text style={styles.buttonText}>Accept</Text>
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
