import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword ,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';  
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import 'firebase/firestore'

export default function TabThreeScreen({}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [classYear, setClassYear] = useState('');
  const [major, setMajor] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth  = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  // Function to generate a random username
  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Sad', 'Funny', 'Clever', 'Lucky', 'Graceful'];
    const nouns = ['Apple', 'Banana', 'Orange', 'Cat', 'Dog', 'Tiger'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective} ${randomNoun}`;
  };

  useEffect(() => {
    setUsername(generateRandomUsername());
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };
  // We can add logic here later to send data to Firebase
  
  const handleSaveProfile = async () => {
    setIsEditing(false);
    
    // sign up with email and password
   
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // send email verification, then after successful verification add the user to database 'user' collection
      await sendEmailVerification(user);
      // db.collection()
      // // add user to database 'user' collection
      // // await db.collection('users').doc(user.uid).set({
      // //   username: username,
      // //   classYear: classYear,
      // //   major: major,
      // //   hobbies: hobbies,
      // //   phoneNumber: phoneNumber,
      // //   email: email
      // // });
      
    
      console.log(user);
      
    } catch (error) {
      console.log(error);
    }

  };

  const handleRegenerateUsername = () => {
    setUsername(generateRandomUsername());
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView contentContainerStyle={styles.container}>
      {isEditing ? (
        <View>
          <Text style={styles.editProfileTitle}>Edit Profile</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Class Year"
            value={classYear}
            onChangeText={(text) => setClassYear(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Major"
            value={major}
            onChangeText={(text) => setMajor(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Hobbies"
            value={hobbies}
            onChangeText={(text) => setHobbies(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            style={[styles.input, { color: textColor }]}
          />
          
          <Button title="Save Profile" onPress={handleSaveProfile} />
        </View>
      ) : (
        <View>
          <Text style={styles.welcomeTitle}>Welcome, {username}</Text>
          <FontAwesome.Button
              name="refresh" // Icon name for the swirly arrow (you can change this)
              backgroundColor="transparent"
              onPress={handleRegenerateUsername}
            />
          <Text style={[styles.details, { color: textColor }]}>Class Year: {classYear}</Text>
          <Text style={[styles.details, { color: textColor }]}>Major: {major}</Text>
          <Text style={[styles.details, { color: textColor }]}>Hobbies: {hobbies}</Text>
          <Text style={[styles.details, { color: textColor }]}>Phone Number: {phoneNumber}</Text>
          <Text style={[styles.details, { color: textColor }]}>Email: {email}</Text>
          <Button title="Edit Profile" onPress={handleEditProfile} />
        </View>
      )}
    </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', 
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 250,
  },
  details: {
    fontSize: 16,
    marginVertical: 5,
  },
});
