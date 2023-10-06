import React, { useState } from 'react';

import {
  StyleSheet,
  Button,
  KeyboardAvoidingView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  ScrollView,
  Alert
} from 'react-native';

import { Text, View, TextInput } from '../components/Themed'

import { router } from 'expo-router';

import {
  signInWithEmailAndPassword ,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';  
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import 'firebase/firestore'
import { getFirestore, doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';

import ResetPassword from '../components/ResetPassword';
import EditProfile from '../components/EditProfile';

enum AuthState {
  Undetermined,
  EnterEmailPassword,
  VerifyEmail,
  CreateProfile
}

const EMAIL_DOMAIN = "@duke.edu"
const HOME_PAGE = "/(tabs)/search"

export default function Index() {

  const [authState, setAuthState] = useState(AuthState.Undetermined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const db = FIREBASE_DB;
  const firestore = getFirestore(FIREBASE_APP);
  
  FIREBASE_AUTH.onAuthStateChanged((user) => {
    if (authState == AuthState.Undetermined) {
      if (user) { 
        if (user.emailVerified) {
          checkIfProfileExists()
        }
        else { setAuthState(AuthState.VerifyEmail); }
      }
      else { setAuthState(AuthState.EnterEmailPassword); }
    }
  })

  const checkIfProfileExists = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      try {
        const querySnapshot = await getDocs(
          query(collection(firestore, 'users'), where('uid', '==', user!.uid))
        );
        if (querySnapshot.docs.length > 0) {
          router.replace(HOME_PAGE);
        }
      } catch (error) {
        console.error(error);
      }
    }
    setAuthState(AuthState.CreateProfile);
  }

  const handleLogin = async () => {
    const fullEmail = email + EMAIL_DOMAIN;

    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, fullEmail, password);
      const user = FIREBASE_AUTH.currentUser;
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email':
          Alert.alert("Invalid Email", "Please enter a valid Duke email address. Do not include '@duke.edu'. It will be added automatically.");
          return;
        case 'auth/user-disabled':
          Alert.alert("Account Disabled", "Your account has been disabled. Please contact an administrator.");
          return;
        case 'auth/user-not-found':
          Alert.alert("Account Not Found", "An account with this email address does not exist.");
          return;
        case 'auth/wrong-password':
          Alert.alert("Incorrect Password", "The password you entered is incorrect.");
          return;
        case 'auth/invalid-login-credentials':
          Alert.alert("Invalid Login Credentials", "Please enter a valid Duke email address and password.");
          return;
        default:
          Alert.alert("Error", "There was an error when attempting to log in. Please try again.");
          return;
      }
    }
  }

  const handleCreateAccount = async () => {    
    const fullEmail = email + EMAIL_DOMAIN;

    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, fullEmail, password);
      const user = userCredential.user;
      // one possible implementation 
      // await sendEmailVerification(user);
      await sendEmailVerification(user)
    } catch (error:any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert("Account Exists", "An account with this email address already exists.");
          return;
        case 'auth/invalid-email':
          Alert.alert("Invalid Email", "Please enter a valid Duke email address. Do not include '@duke.edu'. It will be added automatically.");
          return;
        case 'auth/weak-password':
          Alert.alert("Weak Password", "Your password is not strong enough. It must contain at least six characters.");
          return;
        case 'auth/operation-not-allowed':
        default:
          Alert.alert("Error", "There was an error when attempting to create your account. Please try again.");
          return;
      }
    }
    
    setAuthState(AuthState.VerifyEmail)
  }

  const handleVerifyEmail = async () => {
    const user = FIREBASE_AUTH.currentUser!;
    await user.reload();

    if (!user.emailVerified) {
      Alert.alert("Email Not Verified", "Your email has not yet been verified. Please check your email for a verification link.");
      return;
    }

    setAuthState(AuthState.CreateProfile)
  }

  const handleCreateProfile = async () => {
    // create user chat
    const user = FIREBASE_AUTH.currentUser!;
    await setDoc(doc(db, 'userchats', user.uid),{})
    
    router.replace(HOME_PAGE)
  }
  
  const returnBody = () => {
    switch(authState) {
      case AuthState.EnterEmailPassword: return (
        <View style={styles.emailPasswordContainer}>
          <View style={styles.emailContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, styles.emailInput]}
              inputMode="email"
            />
            <Text style={styles.emailDomain}>{EMAIL_DOMAIN}</Text>
          </View>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.passwordInput]}
            secureTextEntry={true}
          />
          <View style={{height: 20}}></View>
          <View style={styles.loginCreateAccountContainer}>
            <Button title="Login" onPress={handleLogin}/>
            <View style={{flex: 1}}></View>
            <Button title="Create Account" onPress={handleCreateAccount}/>
          </View>
          <ResetPassword text="Forgot Password?" email={email + EMAIL_DOMAIN} />
        </View>
      );
      case AuthState.VerifyEmail: return (
        <View>
          <Text style={{textAlign: "center"}}>Please check '{email + EMAIL_DOMAIN}' for a verification link.</Text>
          <View style={{height: 20}}></View>
          <Button title="I've Verified My Email" onPress={handleVerifyEmail}/>
        </View> 
      );
      case AuthState.CreateProfile: return (
        <View>
          <EditProfile
            titleText='Create Profile'
            includeKeyboardAvoidingView={false}
            showCancel={false}
            saveProfileButtonText='Create Profile'
            handleSaveProfile={handleCreateProfile}
          />
        </View>
      );
      default: return null;
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Welcome to UChat!</Text>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
          {returnBody()}
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  emailPasswordContainer: {
    width: 250,
    flexDirection: "column",
    alignItems: "center",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%"
  },
  emailInput: {
    flex: 1
  },
  emailDomain: {
    marginLeft: 5,
    fontSize: 16,
    textAlign: "center"
  },
  passwordInput: {
    width: "100%"
  },
  loginCreateAccountContainer: {
    flexDirection: "row",
  }
});

