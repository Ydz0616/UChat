import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Button, useColorScheme, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH, FIREBASE_RTDB } from '../firebaseConfig';
import { collection, query, where, doc, onSnapshot, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { Text, View, FontAwesome } from '../components/Themed';
import { useEffect, useState } from 'react';
import ProfilePicture, { defaultProfilePictureURL } from '../components/ProfilePicture';
import { ref, onValue } from "firebase/database";
import { Timestamp, arrayUnion } from 'firebase/firestore';
import {router } from 'expo-router';
export default function ModalScreen() {

  const db = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [showChat, setShowChat] = useState(false);
  const [combinedID, setCombinedID] = useState('' as any)
  const [connection, setConnection] = useState(null as any)
  const [avatar, setAvatar] = useState('' as any)
  const [name, setName] = useState('' as any)
  const [major, setMajor] = useState('' as any)
  const [classYear, setClassYear] = useState('' as any)
  const [hobbies, setHobbies] = useState([] as any)
  const [uid, setUid] = useState('' as any)
  const [online, setOnline] = useState(false)
  const [email, setEmail] = useState('' as any)
  const [phoneNumber, setPhoneNumber] = useState('' as any)
  const rtdb = FIREBASE_RTDB;
  const majorsMap = new Map([
    ['cs', 'Computer Science'],
    ['ece', 'Electrical Engineering'],
    ['math', 'Math'],
    ['physics', 'Physics'],
    ['biology', 'Biology'],
    ['economics', 'Economics'],
    ['romance studies', 'Romance Studies'],
    ['theater studies', 'Theater Studies'],
    ['mechanical engineering', 'Mechanical Engineering'],
    ['civil engineering', 'Civil Engineering'],
    ['bme', 'Biomedical Engineering']
  ]);

  const fetchData = async () => {

    try {
      const notificationsRef = collection(FIREBASE_DB, 'chats');
      // the queryRef should be the doc that the current user is in the users array and the chatting is ture
      const queryRef = query(notificationsRef, where('users', 'array-contains', currentUser?.uid), where('chatting', '==', true));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        var uid = null

        if (!querySnapshot.empty) { setShowChat(true) }

        querySnapshot.forEach((doc) => {
          var chatData = doc.data();
          if (chatData.users[0] == currentUser?.uid) {
            // get the user data from the second user from users collection where the uid is the second user
            uid = chatData.users[1]
          }
          if (chatData.users[1] == currentUser?.uid) {
            // get the user data from the second user from users collection where the uid is the second user
            uid = chatData.users[0]
          }
          if (uid!) {
            setUid(uid)
          }
          const combinedID = currentUser?.uid! > uid!
            ? currentUser?.uid + uid!
            : uid! + currentUser?.uid;
          setCombinedID(combinedID)
          setConnection(chatData.connection)
          getUserData(uid!)
        })
        if (querySnapshot.empty) {
          console.log('empty')
          return
        }
      })
      return () => {
        // Unsubscribe from the snapshot listener when component unmounts
        eventlistener();
      };
    } catch (error) { console.log(error) }
  }



  useEffect(() => {
    fetchData();
  }, []);


  const abortChat = async () => {
    try {
      // update the doc in the chats collection where the combined ID is its identifier and set the chatting to false

      await updateDoc(doc(db, 'chats', combinedID), {
        chatting: false
      })
      const querySnapshot = await getDocs(
        query(collection(db, 'users'), where('uid', '==', currentUser?.uid))
      );
      const querySnapshot2 = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
      if (querySnapshot.docs.length > 0 && querySnapshot2.docs.length > 0) {
        const existingDocRef = querySnapshot.docs[0].ref;
        await updateDoc(existingDocRef, {
          chatting: false,
        });
        const existingDocRef2 = querySnapshot2.docs[0].ref;
        await updateDoc(existingDocRef2, {
          chatting: false,
        });
        Alert.alert('Chat Aborted')
        router.replace('/(tabs)/chat')
      }

    } catch (error) { console.log(error) }
  }
  const reportUser = async () => {
    try {
      // update the doc in the chats collection where the combined ID is its identifier and set the chatting to false
      router.replace('/(tabs)/help')
      // await updateDoc(doc(db,'chats',combinedID), {
      //   chatting: false
      // })
      // const querySnapshot = await getDocs(
      //   query(collection(db, 'users'), where('uid', '==', currentUser?.uid))
      // );
      // const querySnapshot2 = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)))
      // if (querySnapshot.docs.length > 0 && querySnapshot2.docs.length > 0) {
      //   const existingDocRef = querySnapshot.docs[0].ref;
      //   await updateDoc(existingDocRef, {
      //     chatting: false,
      //   });
      //   const existingDocRef2 = querySnapshot2.docs[0].ref;
      //   await updateDoc(existingDocRef2, {
      //     chatting: false,
      //   });
      //   // upload a doc to report collection with the uid of reporter and the uid of the reported user and the type
      //   await setDoc(doc(db,'report',combinedID),{
      //     reporter: currentUser?.uid,
      //     reported: uid,
      //     id: combinedID,
      //     type: 'harassment'
      //   })
      //   Alert.alert('User Reported') 
      // }

    } catch (error) { console.log(error) }
  }
  const getUserData = async (uid: any) => {
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('uid', '==', uid))
    );
    console.log(querySnapshot.docs[0].data())
    setName(querySnapshot.docs[0].data().username)
    setAvatar(querySnapshot.docs[0].data().profilepic)
    setMajor(querySnapshot.docs[0].data().major)
    setClassYear(querySnapshot.docs[0].data().classYear)
    setHobbies(querySnapshot.docs[0].data().hobbies)
    setEmail(querySnapshot.docs[0].data().email)
    setPhoneNumber(querySnapshot.docs[0].data().phoneNumber)
    // fectch the online status from realtime database 'status / state'
    const userStatusDatabaseRef = ref(rtdb, `/status/${uid}`);
    onValue(userStatusDatabaseRef, (snapshot) => {
      console.log(snapshot.val())
      if (snapshot.val().state == 'online') {
        setOnline(true)
      } else {
        setOnline(false)
      }
    });


  }

  const sendConnectRequest = async () => {
    Alert.alert(`Connect with ${name}`,
      `${name} will be notified of your connection request. If they agree to connect, your emails and phone numbers will be exchanged.`, [
      {
        text: 'Cancel',
        style: "cancel"
      },
      {
        text: "Connect", onPress: async () => {
          try {
            const newMessageObj = { id: Timestamp.now(), text: "I've sent you a connection request. Tap (i) to accept.", sender_id: currentUser?.uid };
            await updateDoc(doc(db, 'chats', combinedID), {
              connection: currentUser?.uid,
              messages: arrayUnion(newMessageObj)
            })
          } catch (error) { console.log(error) }
        }
      }
    ]);
  }

  const acceptConnectRequest = async () => {
    Alert.alert(`Connect with ${name}`,
      `${name} will be notified of your acceptance. Your emails and phone numbers will be exchanged immediately.`, [
      {
        text: 'Cancel',
        style: "cancel"
      },
      {
        text: "Connect", onPress: async () => {
          try {
            const newMessageObj = { id: Timestamp.now(), text: "I've accepted your connection request. Tap (i) to view my email and phone number.", sender_id: currentUser?.uid };
            await updateDoc(doc(db, 'chats', combinedID), {
              connection: "done",
              messages: arrayUnion(newMessageObj)
            })
          } catch (error) { console.log(error) }
        }
      }
    ]);
  }

  const showVerifiedAlert = () => {
    Alert.alert(`Verified Information`,
      `Email: ${email}`, [
      {
        text: 'OK',
        style: "cancel"
      }
    ]);
  }

  const getConnectView = () => {
    console.log("connection", connection, "end")
    switch(connection){
      case 'none':
        return <Button title="Connect" onPress={sendConnectRequest} />
      case currentUser?.uid:
        return <Text style={[styles.details, { color: textColor, fontStyle: 'italic' }]}>Connection Request Pending...</Text>
      case uid:
        return <Button title="Accept Connect Request" onPress={acceptConnectRequest} />
      case 'done':
        return [
          <View key="1" style={{flexDirection: "row", alignItems: "center"}}>
            <FontAwesome name="check" size={24} color="black" style={{opacity: 0}}/>
            <View style={{width: 10}} />
            <Text style={[styles.details, { color: textColor }]}>{email}</Text>
            <View style={{width: 10}} />
            <FontAwesome name="check" size={24} color="black" onPress={showVerifiedAlert}/>
          </View>,
          <Text key="2" style={[styles.details, { color: textColor }]}>{phoneNumber}</Text>,
          <Text key="3" style={[styles.details, { color: textColor, fontStyle: 'italic' }]}>Connection Established</Text>
        ]
      case null:
        return <></>
      default:
        try {
          console.log("update doc")
          updateDoc(doc(db, 'chats', combinedID), {
            connection: "none"
          })
        } catch (error) { console.log(error) }
        return <></>
    }
  }

  return (
    <View style={styles.container}>
      {showChat ? (
        <View>
          <View style={styles.centerContent}>
            <ProfilePicture profilePicture={avatar || defaultProfilePictureURL} />
            {online ? (
              <View style={[styles.onlineDot, { backgroundColor: 'green' }]} />
            ) : (
              <View style={[styles.onlineDot, { backgroundColor: 'red' }]} />
            )}
          </View>
          <View style={styles.centerContent}>
            <Text style={styles.title}>{name}</Text>
            <Text style={[styles.details, { color: textColor }]}>{classYear}</Text>
            <Text style={[styles.details, { color: textColor }]}>{majorsMap.get(major)}</Text>

            {hobbies.map((hobby: any, index: any) => (
              <Text key={index} style={[styles.details, { color: textColor }]}>
                {hobby}
              </Text>
            ))}

            {/* <Text style={[styles.details, { color: textColor }]}>{online ? 'Online' : 'Offline'}</Text> */}

            {getConnectView()}

            <View style={{ height: 20 }} />

            <Button title='Abort Chat' color='red' onPress={abortChat}></Button>
            <Button title='Report User' color='red' onPress={reportUser}></Button>
          </View>
        </View>
      ) : (<View style={styles.container}>
        <Text style={styles.title}>
          Tips
        </Text>

        {/* <View> <GetUser></GetUser></View> */}
        <Text style={styles.details}>
          Go to <Text style={styles.blueUnderline}>search page</Text> to look for a user to chat with
        </Text>
        <Text style={styles.details}>
          Try <Text style={styles.blueUnderline}>shaking your phone</Text> and see what happens
        </Text>
        <Text style={styles.details}>
          Go to <Text style={styles.blueUnderline}>inbox page</Text> to receive friend requests
        </Text>


        <Text style={styles.details}>
          Go to <Text style={styles.blueUnderline}>profile page</Text>  edit your profile
        </Text>
      </View>)}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueUnderline: {
    color: 'blue',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,

  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  details: {
    fontSize: 15,
    marginVertical: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  onlineDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'green', // Default to green; you can customize as needed
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 1, // Ensure the dot is above the profile picture
  },
});


