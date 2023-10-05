import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text, View, TextInput } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, query, where, serverTimestamp, addDoc } from 'firebase/firestore';

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
  loaderContainer: {
    flex: 1,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'black', // Set the color to blue
    fontWeight: 'bold', // Optionally, you can make the text bold
  },
  redirect: {
    fontSize: 14,
    color: '#c2e0fc',
    textDecorationLine: 'underline',
  },
  status: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'gray',
  },
});

export default function TabOneScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [searchTerm, setSearchTerm] = useState('');
  const [userHobbies, setUserHobbies] = useState<Person[]>([]);
  const [userFriends, setUserFriends] = useState(new Set())
  const [pendingRequests, setPendingRequest] = useState(new Set())

  const user = FIREBASE_AUTH.currentUser;
  const fetchData = async () => {
    setIsLoading(true)
    // TODO: add timeout

    try {
      const users = collection(FIREBASE_DB, 'users');

      // Fetch user friends
      const friendsQuerySnapshot = await getDocs(
        query(users, where('uid', '==', user!.uid))
      );

      let friends = []
      if (friendsQuerySnapshot.docs.length > 0) {
        const userData = friendsQuerySnapshot.docs[0].data();
        friends = userData?.friends;
      }
      if (friends) {
        friends.forEach((friendUid: string) => setUserFriends(userFriends.add(friendUid)))
      }


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


      // Fetch all users where hobbies match search term
      const searchTermSplit = searchTerm.split(',').map(term => term.trim().toLowerCase());
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

      setIsLoading(false)
    } catch (error) {
      console.error(error);
    }
  }

  // only fetch all users on initial load
  useEffect(() => {
    fetchData();
  }, [refresh]);

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
      Alert.alert(`Friend Request Sent to ${receiverUsername}!`, '', [{text: 'OK', onPress: () => setRefresh(refresh + 1)}])
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
      {isLoading ?
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating={true} size={'large'} color={'black'} />
        </View>
        : null}
      {userHobbies.length > 0 && !isLoading ?
        <FlatList
          data={userHobbies}
          renderItem={({ item }) => (
            <View style={styles.resultContainer}>
              <Text style={styles.nameText}>{item.username}</Text>
              <Text>{item.hobbies.join(', ')}</Text>
              {/* change option depending on friend and potential request status */}
              {userFriends.has(item.uid) ? <Text style={styles.status}>Already friends!</Text> :
                pendingRequests.has(item.uid) ? <Text style={styles.status}>Friend request pending...</Text> :
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
        : null}

    </View>
  );
}
