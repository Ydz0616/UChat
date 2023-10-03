import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, Button, TextInput, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import {
  getAuth,
  signInWithEmailAndPassword ,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';  
import { updateDoc } from 'firebase/firestore';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { getFirestore, collection, addDoc, query, where, updateDoc, getDocs } from 'firebase/firestore';

export default function TabThreeScreen({}) {
  const firestore = getFirestore(FIREBASE_APP);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [classYear, setClassYear] = useState(0);;
  const [major, setMajor] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
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
    const user = auth.currentUser;
    const updateProfileData = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(firestore, 'users'), where('uid', '==', user!.uid))
        );
        if (querySnapshot.docs.length > 0) {
          const userData = querySnapshot.docs[0].data();
          setClassYear(userData.classYear);
          setMajor(userData.major);
          setHobbies(userData.hobbies); // Convert the array back to a string
          setPhoneNumber(userData.phoneNumber);
          setPassword(userData.password);
          setEmail(user!.email ?? '');
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Call the async function immediately when the component mounts
    if (user){
      updateProfileData();
    }

  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = async () => {
    setIsEditing(false);


    try {
      // Get the current user from Firebase Authentication
      const user = auth.currentUser;

      // Ensure the user is signed in before proceeding
      if (user) {
        setEmail(user.email ?? "");
        // send email verification if not already verified
        if (!user.emailVerified) {
          await sendEmailVerification(user);
        }
            // Check if any required field is empty
        if (!classYear || !major || !hobbies || !phoneNumber || !password) {
          Alert.alert("Not all of the fields are filled.", "Please fill in the fields.", [
            {text: "Ok"}
          ]);
          return;
        }
  
        // Query Firestore to check if the user's UID already exists
      const querySnapshot = await getDocs(
        query(collection(firestore, 'users'), where('uid', '==', user.uid))
      );

      if (querySnapshot.docs.length > 0) {
        // User's UID already exists; update the existing document
        const existingDocRef = querySnapshot.docs[0].ref;
        await updateDoc(existingDocRef, {
          username: username,
          classYear: classYear,
          major: major,
          hobbies: hobbies.map(hobby => hobby.trim()), // Assuming hobbies is a comma-separated list
          phoneNumber: phoneNumber,
          password: password,
          email: user.email,
        });
      } 
      else {
        // User's UID doesn't exist; create a new document
        await addDoc(collection(firestore, 'users'), {
          uid: user.uid,
          username: username,
          classYear: classYear,
          major: major,
          hobbies: hobbies.map(hobby => hobby.trim()),
          phoneNumber: phoneNumber,
          password: password,
          email: user.email,
        });
      }
        console.log(hobbies.map(hobby => hobby.trim()))
        console.log(user);
      } else {
        console.log("User not signed in.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView contentContainerStyle={styles.container}>
      {isEditing ? (
        <View>
          <Text style={styles.editProfileTitle}>Edit Profile</Text>
          {/* <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={[styles.input, { color: textColor }]}
          /> */}
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={[styles.input, { color: textColor }]}
          />
          <TextInput
            placeholder="Class Year"
            value={classYear.toString()} // Convert the number to a string for the input value
            onChangeText={(text) => {
              const parsedValue = parseInt(text, 10); // Parse the input as an integer
              if (!isNaN(parsedValue)) {
                setClassYear(parsedValue);
              } else {
                setClassYear(0); // Set a default value if the input is not a valid integer
              }
            }}
            keyboardType="numeric" // Use a numeric keyboard
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
            value={hobbies.join(',')}
            onChangeText={(text) => setHobbies(text.split(','))}
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
          <Text style={[styles.details, { color: textColor }]}>Class Year: {classYear}</Text>
          <Text style={[styles.details, { color: textColor }]}>Major: {major}</Text>
          <Text style={[styles.details, { color: textColor }]}>Hobbies: {hobbies.join(", ")}</Text>
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
