import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Button, useColorScheme, Image } from 'react-native';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

import { Text, View } from '../../components/Themed';
import EditProfile from '../../components/EditProfile'
import ResetPassword from '../../components/ResetPassword';
import SignOut from '../../components/SignOut';
import ProfilePicture, { defaultProfilePictureURL } from '../../components/ProfilePicture';

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
  const [profilePicture, setProfilePicture] = useState(defaultProfilePictureURL);
  const [profileSaveCount, setProfileSaveCount] = useState(0);
  const auth  = FIREBASE_AUTH;
  const db = FIREBASE_DB;

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
          setEmail(user!.email ?? '');
          setProfilePicture(userData.profilepic ? userData.profilepic :
             defaultProfilePictureURL);

        }
      } catch (error) {
        console.error(error);
      }
    };
  
    // Call the async function immediately when the component mounts
    if (user) {
      updateProfileData();
    }

  }, [profileSaveCount]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setProfileSaveCount(profileSaveCount + 1);
  };

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleChangeEmail = () => {
    Alert.alert('Change Email', 'Unfortunately, you cannot change your email at this time. You may sign out and create a new account with a different email.')
  }

  if (isEditing) {
    return (
      <View style={styles.container}>
        <EditProfile
          titleText="Edit Profile"
          includeKeyboardAvoidingView={true}
          showCancel={true}
          handleCancel={handleCancel}
          saveProfileButtonText="Save Profile"
          handleSaveProfile={handleSaveProfile}
        />
      </View>
    );
  }
  else {
    return (
      <View style={styles.container}>
        <ProfilePicture profilePicture={profilePicture || defaultProfilePictureURL} />
        <Text style={styles.welcomeTitle}>Hello, {username}!</Text>
        <Text style={[styles.details, { color: textColor }]}>Class Year: {classYear}</Text>
        <Text style={[styles.details, { color: textColor }]}>Major: {major}</Text>
        <Text style={[styles.details, { color: textColor }]}>Hobbies: {hobbies.join(", ")}</Text>
        <Text style={[styles.details, { color: textColor }]}>Phone Number: {phoneNumber}</Text>
        <Text style={[styles.details, { color: textColor }]}>Email: {email}</Text>
        <Button title="Edit Profile" onPress={handleEditProfile} /> 
        <View style={{height: 20}}></View>
        <Button title="Change Email" onPress={handleChangeEmail} />
        <View style={{height: 20}}></View>
        { email ? <ResetPassword text="Reset Password" email={email} /> : null }
        <View style={{height: 20}}></View>
        <SignOut text="Sign Out" />
        {/* TODO: Change my email (display alert), change password, log out, delete account */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    marginVertical: 5,
  },
});
