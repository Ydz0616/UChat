

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
import { updateDoc, doc,addDoc, setDoc ,getDoc,  serverTimestamp, onSnapshot, collection } from '@firebase/firestore';


  

// Attempt to create chat between current user and another user
export async function CreateChat(otherUserUid: string) { 
        const db  = FIREBASE_DB;
        const currentUser = FIREBASE_AUTH.currentUser;
        // this is a static test example, we'll inpelement real examples
        // after the notification system is done
    
        // check whether the group exists, if not, create
        if(currentUser?.uid){
          const combinedID = currentUser?.uid> otherUserUid 
          ? currentUser?.uid + otherUserUid 
          : otherUserUid + currentUser?.uid;
         
          try{
            console.log(combinedID, '------------start-----------');
            const res = await getDoc(doc(db, 'chats', combinedID));
            console.log(res);
            if(!res.exists()){
              console.log('creating new chat');
     
              await setDoc(doc(db, 'chats',combinedID), {
                id: combinedID,
                users: [currentUser?.uid, otherUserUid],
                messages: []
              })
              
              await setDoc(doc(db,'userchats', currentUser?.uid),{
                [combinedID+".userInfo"]:{
                  uid:otherUserUid
                },
                [combinedID+".timestamp"]: serverTimestamp()
    
              })
              await setDoc(doc(db,'userchats', otherUserUid),{
                [combinedID+".userInfo"]:{
                  uid:currentUser?.uid 
                },
                [combinedID+".timestamp"]: serverTimestamp()
    
              })
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