import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Button, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Pressable } from 'react-native';
import { FontAwesomeButton } from '../components/Themed';
import { ScrollView } from 'react-native';
import { Text, View, TextInput } from './Themed';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { getFirestore, collection, addDoc, query, where, updateDoc, getDocs } from 'firebase/firestore';
import ProfilePicture from './ProfilePicture';
import { getRandomProfilePicture } from './ProfilePicture';
import DropDownPicker from 'react-native-dropdown-picker';

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

  const [open, setOpen] = useState(false);
  const [major,setMajor] = useState(null);
  const [majors, setItems] = useState([
        {label: 'Computer Science', value: 'cs'},
        {label: 'Electrical Engineering', value: 'ee'}
               ]);
  
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('https://firebasestorage.googleapis.com/v0/b/icebreaker-16bc6.appspot.com/o/default.png?alt=media&token=896c58fb-f80a-4664-bc82-b12727ccb541');

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  // Function to generate a random username
  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Sad', 'Funny', 'Clever', 'Lucky', 'Graceful'];
    const nouns = ['Apple', 'Banana', 'Orange', 'Cat', 'Dog', 'Tiger'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective} ${randomNoun}`;
  };
  const updateProfilePicture = () => {
    const newProfilePicture = getRandomProfilePicture();
    setProfilePicture(newProfilePicture);
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
          setProfilePicture(userData.profilepic);
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
            { text: "Ok" }
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
            hobbies: hobbies.map(hobby => hobby.trim().toLowerCase()),
            phoneNumber: phoneNumber,
            profilepic: profilePicture
          });
        }
        else {
          // User's UID doesn't exist; create a new document
          await addDoc(collection(firestore, 'users'), {
            uid: user.uid,
            username: username,
            classYear: classYear,
            major: major,
            hobbies: hobbies.map(hobby => hobby.trim().toLowerCase()),
            phoneNumber: phoneNumber,
            profilepic: profilePicture,
            chatting: false
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

  const handleHobbyAdd = () => { setHobbies([...hobbies, '']) }
  const handleHobbyChange = (value: string, idx: number) => {
    let updatedHobbies = [...hobbies]
    if (value) {
      updatedHobbies[idx] = value
    } else {
      // Remove hobby if text is completely deleted
      updatedHobbies.splice(idx, 1)
    }
    
    setHobbies(updatedHobbies)
  }

  const body = (
    <View>
      <Text style={styles.editProfileTitle}>{titleText}</Text>
      <ProfilePicture profilePicture={profilePicture} />
      <FontAwesomeButton
        name="refresh" // Icon name for the swirly arrow (you can change this)
        backgroundColor="transparent"
        onPress={updateProfilePicture}
      />
      <View style={styles.usernameContainer}>
        <Text style={styles.username}>{username}</Text>
        <FontAwesomeButton
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
        
        <DropDownPicker
            open={open}
            value={major}
            items={majors}
            setOpen={setOpen}
            setValue={setMajor}
            setItems={setItems}
            style={[styles.input, { backgroundColor: 'white', borderColor: 'gray' }]} 
            />    
        {/* <TextInput
        placeholder="Hobbies"
        value={hobbies.join(',')}
        onChangeText={(text) => setHobbies(text.split(','))}
        style={[styles.input, { color: textColor }]}
        />
        <TextInput
      /> */}

      <View style={[styles.input]}>
        <View style={styles.hobbiesContainer}>
          {hobbies.map((item, idx) =>
            <TextInput
              style={styles.hobbyItem}
              placeholder='new'
              value={item}
              onChangeText={(text) => handleHobbyChange(text, idx)} />
          )}
        </View>
        <Pressable style={styles.btnNewHobby} onPress={handleHobbyAdd}>
          <Text style={styles.btnTextNewHobby}>add new hobby</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={[styles.input, { color: textColor }]}
      />

      <View style={styles.cancelSaveProfileContainer}>
        {showCancel ? (
          <Button title="Cancel" color='red' onPress={handleCancel} />
        ) : null}
        {showCancel ? (<View style={{ flex: 1 }}></View>) : null}
        <Button title={saveProfileButtonText} onPress={saveProfile} />
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
  },
  hobbiesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  hobbyItem: {
    marginBottom: 5,
    marginRight: 5,
    padding: 3,
    paddingHorizontal: 9,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 10,
    letterSpacing: 0.5
  },
  btnNewHobby: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  btnTextNewHobby: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'gray'
  }
});
