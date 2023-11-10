import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { Text, View, TextInput } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, getDocs, setDoc,query, where, orderBy, serverTimestamp,doc, or } from 'firebase/firestore';

interface Person {
  uid: string;
  username: string;
  hobbies: string[];
  profilePicture: string;
}

export default function TabOneScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [userHobbies, setUserHobbies] = useState<Person[]>([]);
  const [userFriends, setUserFriends] = useState(new Set())
  const [pendingRequests, setPendingRequest] = useState(new Set())
  const [profilePicture, setProfilePicture] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const user = FIREBASE_AUTH.currentUser;
  const fetchData = async (initial: boolean) => {
    if (initial) {
      setIsLoading(true)
    }
    else {
      setIsRefreshing(true)
    }
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
        query(collection(FIREBASE_DB, 'notifications'), or(where('sender', '==', user!.uid), where('receiver', '==', user!.uid)))
      );
      requestQuerySnapshot.forEach((doc) => {
        const request = doc.data();
        if (request?.status === 'pending') {
          setPendingRequest(pendingRequests.add(request.receiver))
        }
      });


      // Fetch all users where hobbies match search term
      const q = query(users, orderBy("username"));
      const usersQuerySnapshot = await getDocs(q);

      const hobbiesData: Person[] = [];
      usersQuerySnapshot.forEach((doc) => {
        const queryUser = doc.data();

        if (queryUser.uid == user!.uid) {
          return;
        }

        hobbiesData.push({
          uid: queryUser.uid,
          username: queryUser.username,
          hobbies: queryUser.hobbies === null ? ['No Hobbies'] : queryUser.hobbies,
          profilePicture: queryUser.profilepic || 'https://firebasestorage.googleapis.com/v0/b/icebreaker-16bc6.appspot.com/o/default.png?alt=media&token=896c58fb-f80a-4664-bc82-b12727ccb541',
        });
      });

      hobbiesData.sort((a, b) => {
        if (a.username.toLowerCase() < b.username.toLowerCase()) {
          return -1;
        }
        if (a.username.toLowerCase() > b.username.toLowerCase()) {
          return 1;
        }
        return 0;
      });
      
      setUserHobbies(hobbiesData);

      if (initial) {
        search(searchTerm, hobbiesData)
      }

      if (initial) {
        setIsLoading(false)
      }
      else {
        setIsRefreshing(false)
      }
    } catch (error) {
      console.error(error);
    }
  }

  // only fetch all users on initial load
  useEffect(() => {
    fetchData(true);
  }, []);

  const search = (newSearchTerm: string, hobbies?: Person[]) => {
    if (!hobbies) {
      hobbies = userHobbies
    }

    setSearchTerm(newSearchTerm)

    if (newSearchTerm == '') {
      setSearchResults(hobbies)
      return
    }

    const searchTermSplit = newSearchTerm.split(',').map(term => term.trim().toLowerCase());
    const filteredResults = hobbies.filter((user) => {
      return searchTermSplit.some((term) =>
        user.hobbies.some(hobby => hobby.includes(term)) || 
        user.username.toLowerCase().includes(term)
      );
    });
    setSearchResults(filteredResults)
  }

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
      // if user!.id > receiverUid, then combinedID = receiverUid + user!.id
      // else combinedID = user!.id + receiverUid

      const combinedID = user!.uid > receiverUid ?  user!.uid + receiverUid : receiverUid + user!.uid 
      await setDoc(doc(FIREBASE_DB, 'notifications',combinedID), {
        type: 'friend-request',
        sender: user!.uid,
        receiver: receiverUid,
        status: 'pending',
        timestamp: serverTimestamp()
      })
      Alert.alert(`Friend Request Sent to ${receiverUsername}!`, '', [{text: 'OK', onPress: () => fetchData(false)}])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by hobby"
        onChangeText={search}
        value={searchTerm}
        returnKeyType="search"
      />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating={true} size="large" color="black" />
        </View>
      ) : null}
      {searchResults.length > 0 && !isLoading ? (
        <FlatList
          data={searchResults}
          onRefresh={() => fetchData(false)}
          refreshing={isRefreshing}
          renderItem={({ item, index }) => (
            <View style={styles.resultContainer}>
              <View style={styles.userInfoContainer}>
                <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
                <View style={styles.userInfoText}>
                  <Text style={styles.nameText}>{item.username}</Text>
                  <Text>{item.hobbies.join(', ')}</Text>
                  {/* Change option depending on friend and potential request status */}
                  {userFriends.has(item.uid) ? <Text style={styles.status}>Already friends!</Text> :
                    pendingRequests.has(item.uid) ? <Text style={styles.status}>Friend request pending...</Text> :
                      item.username ? (
                        <Pressable onPress={() => handleUserRequestAction(item.username, item.uid)}>
                          <Text style={styles.redirect}>Send friend request</Text>
                        </Pressable>
                      ) : null
                  }
                </View>
              </View>
              { index < searchResults.length - 1 && (
                <View
                  lightColor="black"
                  darkColor="white"
                  style={{
                    height: StyleSheet.hairlineWidth,
                    marginTop: 8
                  }}
                />
              )}
            </View>
          )}
          keyExtractor={(item) => item.uid}
        />
      ) : !isLoading ? <Text>No results match your search</Text> : null}
    </View>
  );
  
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
    borderRadius: 8,
  },
  resultContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 20, // Set the font size to make the name larger
    fontWeight: 'bold', // Optionally, you can make the text bold
  },
  redirect: {
    fontSize: 14,
    color: 'lightblue',
    textDecorationLine: 'underline',
  },
  status: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'gray',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40, // Adjust the width and height as needed
    height: 40,
    borderRadius: 20, // Make it circular
    marginRight: 10, // Add some spacing to the right of the picture
  },
  userInfoText: {
    flex: 1,
  },
});
