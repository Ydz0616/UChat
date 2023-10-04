import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { Text, View, TextInput } from '../../components/Themed';
import { NavigationAction } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';

interface Person {
  uid: string;
  username: string;
  hobbies: string[];
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    color: 'black',
    backgroundColor: '#c9fdcd',
    borderRadius: 8,
  },
  resultContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 20, // Set the font size to make the name larger
    color: '#c2e0fc', // Set the color to blue
    fontWeight: 'bold', // Optionally, you can make the text bold
  },
  redirect: {
    fontSize: 14,
    color: '#c2e0fc',
    textDecorationLine: 'underline',
  },
});

export default function TabOneScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userHobbies, setUserHobbies] = useState<Person[]>([]);
  const [userFriends, setUserFriends] = useState(new Set())
  const [pendingRequests, setPendingRequest] = useState(new Set())

  const user = FIREBASE_AUTH.currentUser;
  const fetchData = async () => {
    try {
      // Fetch all users where hobbies match search term
      const users = collection(FIREBASE_DB, 'users');
      const searchTermSplit = searchTerm.split(',').map(term => term.trim().toLowerCase()); // TODO: add back in toLowerCase()

      const q = searchTerm == '' ? query(users) : query(users, where('hobbies', 'array-contains-any', searchTermSplit));
      const usersQuerySnapshot = await getDocs(q);

      const hobbiesData: Person[] = [];
      usersQuerySnapshot.forEach((doc) => {
        const user = doc.data();
        hobbiesData.push({
          uid: user.uid,
          username: user.username,
          hobbies: user.hobbies === null ? ['No Hobbies'] : user.hobbies,
        });
      });

      setUserHobbies(hobbiesData);

      // Fetch user friends
      const friendsQuerySnapshot = await getDocs(
        query(users, where('uid', '==', user!.uid))
      );

      let friends = []
      if (friendsQuerySnapshot.docs.length > 0) {
        const userData = friendsQuerySnapshot.docs[0].data();
        friends = userData?.friends;
      }
      friends.forEach((friendUid: string) => setUserFriends(userFriends.add(friendUid)))

      // Fetch their pending requests
      const requestQuerySnapshot = await getDocs(
        query(collection(FIREBASE_DB, 'notifications'), where('sender', '==', user!.uid))
      );
      requestQuerySnapshot.forEach((doc) => {
        const request = doc.data();
        if (request?.status === 'pending') {
          setPendingRequest(pendingRequests.add(request.receiver))
        }
      });

      setUserHobbies(hobbiesData);
    } catch (error) {
      console.error(error);
    }
  }

  // only fetch all users on initial load
  useEffect(() => {
    fetchData();
  }, []);

  const handleUserRequestAction = async (receiverUsername: string, receiverUid: string) => {
    Alert.alert('Friend Request', `Are you sure that you want to send a friend request to ${receiverUsername}?`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Yes', onPress: () => handleFriendRequest(receiverUsername, receiverUid) },
    ]);
  }

  const handleFriendRequest = async (receiverUsername: string, receiverUid: string) => {
    try {
      await addDoc(collection(FIREBASE_DB, 'notifications'), {
        type: 'friend-request',
        sender: user!.uid,
        receiver: receiverUid,
        status: 'pending',
        timestamp: serverTimestamp()
      })
      Alert.alert(`Friend Request Sent to ${receiverUsername}!`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by hobby"
        onSubmitEditing={fetchData}
        onChangeText={setSearchTerm}
        value={searchTerm}
        returnKeyType='search'
      />
      <FlatList
        data={userHobbies}
        renderItem={({ item }) => (
          <View style={styles.resultContainer}>
            <Text style={styles.nameText}>{item.username}</Text>
            <Text>{item.hobbies.join(', ')}</Text>
            {/* change option depending on friend and potential request status */}
            {userFriends.has(item.uid) ? <Text>Already friends!</Text> :
              pendingRequests.has(item.uid) ? <Text>Friend request pending...</Text> :
                item.username ?
                  <Pressable onPress={() => handleUserRequestAction(item.username, item.uid)}>
                    <Text style={styles.redirect}>Send friend request</Text>
                  </Pressable> :
                  null
            }
          </View>
        )}
        keyExtractor={item => item.uid}
      />
    </View>
  );
}
