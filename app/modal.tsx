import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet ,Button,useColorScheme, Alert} from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { collection, query, where,doc, onSnapshot,getDocs, updateDoc} from 'firebase/firestore';
import { Text, View } from '../components/Themed';
import { useEffect, useState } from 'react';
import ProfilePicture from '../components/ProfilePicture';

export default function ModalScreen() {

  const db  = FIREBASE_DB;
  const currentUser = FIREBASE_AUTH.currentUser;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [showChat, setShowChat] = useState(false);
  const [combinedID, setCombinedID] = useState('' as any)
  const [avatar, setAvatar] = useState('' as any) 
  const [name, setName] = useState('' as any) 
  const [major, setMajor] = useState('' as any)
  const [classYear, setClassYear] = useState('' as any)
  const [hobbies, setHobbies] = useState([] as any)
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
    var uid = null
    try{
      const notificationsRef = collection(FIREBASE_DB, 'chats');
      // the queryRef should be the doc that the current user is in the users array and the chatting is ture
      const queryRef = query(notificationsRef, where('users', 'array-contains', currentUser?.uid),where('chatting','==',true));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        if(!querySnapshot.empty){setShowChat(true)}
        querySnapshot.forEach((doc) => {
          var chatData = doc.data();
          if(chatData.users[0] == currentUser?.uid){
            // get the user data from the second user from users collection where the uid is the second user
            uid = chatData.users[1]
          }
          if(chatData.users[1] == currentUser?.uid){
            // get the user data from the second user from users collection where the uid is the second user
            uid = chatData.users[0]
          }
          const combinedID = currentUser?.uid! > uid! 
            ? currentUser?.uid + uid!
            : uid! + currentUser?.uid;
          setCombinedID(combinedID)
          getUserData(uid!)
        })
        if(querySnapshot.empty){
          console.log('empty') 
          return
        }
      })
      return () => {
        // Unsubscribe from the snapshot listener when component unmounts
        eventlistener();
      };
    }catch(error){console.log(error)}
  }



  useEffect(() => {
    fetchData();
  }, []);


  const abortChat = async () => {
    try{
      // update the doc in the chats collection where the combined ID is its identifier and set the chatting to false
      
      updateDoc(doc(db,'chats',combinedID), {
        chatting: false
      }).then(() => {
       Alert.alert('Chat aborted')
      });
      
    }catch(error){console.log(error)}
  }

  const getUserData = async (uid:any) =>{
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('uid', '==', uid))
    );

    console.log(querySnapshot.docs[0].data())
    setName(querySnapshot.docs[0].data().username)
    setAvatar(querySnapshot.docs[0].data().profilepic)
    setMajor(querySnapshot.docs[0].data().major)
    setClassYear(querySnapshot.docs[0].data().classYear)
    setHobbies(querySnapshot.docs[0].data().hobbies)
    
  }
  return (
  <View style={styles.container}>
    {showChat ? (
      <View>
        <ProfilePicture profilePicture={avatar} />
        <Text style={styles.title}>{name}</Text>
        <Text style={[styles.details, { color: textColor }]}>Class Year: {classYear}</Text>
        <Text style={[styles.details, { color: textColor }]}>Major: {majorsMap.get(major)}</Text>
        <Text style={[styles.details, { color: textColor }]}>Hobbies: {hobbies.join(", ")}</Text>
        <Button title='Abort Chat' onPress={abortChat}></Button>
        <Button title='Exchange Number' onPress={abortChat}></Button>
      </View>
    ) : (<View style = {styles.container}>
      <Text style={styles.details}>
        Oops~ Looks Like You Don't Have a Chat Yet.
      </Text>    
      {/* <View> <GetUser></GetUser></View> */}
      <Text style = {styles.details}>
        Check your Inbox!
      </Text>
      <Text style = {styles.details}>
        Go Search a Friend!
      </Text>
    </View>)}
  </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent:'center',  
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
  details: {
    fontSize: 16,
    marginVertical: 5,
  },
});


