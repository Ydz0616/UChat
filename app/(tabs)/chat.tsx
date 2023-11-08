import { StyleSheet } from 'react-native';
import EditScreenInfo from '../../components/EditScreenInfo';
import { Text, View } from '../../components/Themed';
import Message from '../../components/Message';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


export default function TabTwoScreen() {
  const [showChat, setShowChat] = useState(false);

  // Define a function to handle the button click and show the ChatPage
  const handleAcceptRequest = () => {
    console.log('Accepting request...');
    setShowChat(true);
  };

  return (
    <View style={styles.container}>
      {showChat ? (
        <Message />
      ) : (
        <View>
          <Text style={styles.messageText}>
            You confirmed the friend request from{' '}
            <Text style={styles.senderText}> Happy Cat </Text>. 

            Go Break the Ice!
          </Text>    
          {/* <View> <GetUser></GetUser></View> */}
          <TouchableOpacity onPress={handleAcceptRequest} style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          
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
