import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Button, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView } from 'react-native'; 
import { Text, View, TextInput } from './Themed';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { getFirestore, collection, addDoc, query, where, updateDoc, getDocs } from 'firebase/firestore';

interface EditProfileProps {
  titleText: string;
  includeKeyboardAvoidingView: boolean;
  showCancel: boolean;
  handleCancel?: () => void;
  saveProfileButtonText: string;
  handleSaveProfile: () => void;
}

export default function EditProfile(props: EditProfileProps) {
  const { titleText, includeKeyboardAvoidingView, showCancel, handleCancel, saveProfileButtonText, handleSaveProfile } = props;
  
  const firestore = getFirestore(FIREBASE_APP);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [username, setUsername] = useState('');
  const [classYear, setClassYear] = useState(0);;
  const [major, setMajor] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  
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

  const handleRegenerateUsername = () => {
    setUsername(generateRandomUsername());
  };

  useEffect(() => {
    const user = auth.currentUser;
    const updateProfileData = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(firestore, 'users'), where('uid', '==', user!.uid))
        );
        if (querySnapshot.docs.length > 0) {
          const userData = querySnapshot.docs[0].data();
          setUsername(userData.username)
          setClassYear(userData.classYear);
          setMajor(userData.major);
          setHobbies(userData.hobbies); // Convert the array back to a string
          setPhoneNumber(userData.phoneNumber);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Call the async function immediately when the component mounts
    if (user) {
      updateProfileData();
    }

    if (username === '') {
      setUsername(generateRandomUsername());
    }

  }, []);

  const saveProfile = async () => {
    try {
      // Get the current user from Firebase Authentication
      const user = auth.currentUser;

      // Ensure the user is signed in before proceeding
      if (user) {        
        // Check if any required field is empty
        if (!classYear || !major || !hobbies || !phoneNumber) {
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
            phoneNumber: phoneNumber
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
            phoneNumber: phoneNumber
          });
        }
      } else {
        console.error("User not signed in.");
      }
    } catch (error) {
      console.error(error);
    }

    handleSaveProfile();
  };

  const body = (
    <View>
        <Text style={styles.editProfileTitle}>{titleText}</Text>
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>{username}</Text>
          <FontAwesome.Button
            name="refresh" // Icon name for the swirly arrow (you can change this)
            backgroundColor="transparent"
            onPress={handleRegenerateUsername}
          />
        </View>
        
        <TextInput
        placeholder="Class Year"
        value={classYear == 0 ? '' : classYear.toString()} // Convert the number to a string for the input value
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
        onChangeText={setMajor}
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
        onChangeText={setPhoneNumber}
        style={[styles.input, { color: textColor }]}
        />
        
        <View style={styles.cancelSaveProfileContainer}>
          { showCancel ? ( 
              <Button title="Cancel" color='red' onPress={handleCancel}/>
          ) : null }
          { showCancel ? (<View style={{flex: 1}}></View>) : null }
          <Button title={saveProfileButtonText} onPress={saveProfile}/>
        </View>
    </View>
  )

  if (includeKeyboardAvoidingView) {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        {body}
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
  else {
    return body;
  }
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
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 250,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
    width: 250,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1
  },
  cancelSaveProfileContainer: {
    flexDirection: "row",
    justifyContent: "center",
  }
});
