import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface ProfilePictureProps {
  // Define the type of the profilePicture prop as a URL
  profilePicture: string;
}

const possibleProfilePictures = [
  'https://firebasestorage.googleapis.com/v0/b/icebreaker-16bc6.appspot.com/o/soyjak.png?alt=media&token=23d48382-c373-4e2f-bc54-3e73a4d8cef2',
  'https://firebasestorage.googleapis.com/v0/b/icebreaker-16bc6.appspot.com/o/soyjack2.png?alt=media&token=4bffceba-ecfa-472b-bd7b-55c6194b39ee',
  'https://firebasestorage.googleapis.com/v0/b/icebreaker-16bc6.appspot.com/o/soyjak3.png?alt=media&token=a3e184d3-28cd-4cc5-ba20-927edf2233b2'
  // Add more profile picture URLs
];

export const getRandomProfilePicture = () => {
    const randomIndex = Math.floor(Math.random() * possibleProfilePictures.length);
    return possibleProfilePictures[randomIndex];
  };  

const ProfilePicture: React.FC<ProfilePictureProps> = ({ profilePicture }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: profilePicture }}
        style={styles.profilePicture}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default ProfilePicture;
