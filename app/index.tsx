import React, { useState, useEffect } from 'react';

import { StyleSheet, Button, TextInput, useColorScheme, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';

import { Text, View } from '../components/Themed'

import { router, Link } from 'expo-router';

import {
  getAuth,
  signInWithEmailAndPassword ,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';  
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import 'firebase/firestore'

export default function Index() {

  const [authStateObtained, setAuthStateObtained] = useState(false)

  FIREBASE_AUTH.onAuthStateChanged((user) => {
    console.log(user)
    if (user) {
      console.log("signed in")
      router.replace('/(tabs)/search')
    } else {
      console.log("signed out")
      setAuthStateObtained(true)
    }
  })

  const handleLogin = () => {
    console.log("Login")
  }

  const handleCreateAccount = () => {
      console.log("Create Account")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Icebreaker!</Text>
      {authStateObtained ? (
        <View>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          <Button title="Login" onPress={handleLogin}/>
          <View style={{height: 20}}></View>
          <Button title="Create Account" onPress={handleCreateAccount}/>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  }
});

