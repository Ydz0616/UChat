

import React, { useState, useRef, useEffect } from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_APP } from '../firebaseConfig';
import { updateDoc, doc,addDoc, setDoc ,getDoc,getDocs,where,query, serverTimestamp, onSnapshot, collection } from '@firebase/firestore';


  

// Attempt to create chat between current user and another user
export async function CreateChat(otherUserUid: string) { 
        const db  = FIREBASE_DB;
        const currentUser = FIREBASE_AUTH.currentUser;
        if(currentUser?.uid){
          const combinedID = currentUser?.uid> otherUserUid 
          ? currentUser?.uid + otherUserUid 
          : otherUserUid + currentUser?.uid;
         
          try{
            const res = await getDoc(doc(db, 'chats', combinedID));
            console.log(res);
            if(!res.exists()){
              console.log('creating new chat');
     
              await setDoc(doc(db, 'chats',combinedID), {
                id: combinedID,
                users: [currentUser?.uid, otherUserUid],
                messages: [],
                chatting: true
              })
            }
            else{
              await updateDoc(doc(db, 'chats',combinedID), {
                chatting:true,
                messages:[] // clear messages   
              })
            }
            // update chatting info
            const querySnapshot = await getDocs(
              query(collection(db, 'users'), where('uid', '==', currentUser.uid))
            );
            const querySnapshot2 = await getDocs(query(collection(db, 'users'), where('uid', '==', otherUserUid)))
            if (querySnapshot.docs.length > 0 && querySnapshot2.docs.length > 0) {
              const existingDocRef = querySnapshot.docs[0].ref;
              await updateDoc(existingDocRef, {
                chatting: true,
              });
              const existingDocRef2 = querySnapshot2.docs[0].ref;
              await updateDoc(existingDocRef2, {
                chatting: true,
              });
            }
            
            
          

          }catch(error){
            console.log(error);
          }
        }

      }
  
    


const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF', // Button background color
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 24, // Horizontal padding
    borderRadius: 10, // Border radius for rounded corners
    alignSelf: 'center', // Center the button horizontally
  },
  buttonText: {
    color: 'white', // Text color
    fontSize: 18, // Text font size
    fontWeight: 'bold', // Text font weight
  },
});