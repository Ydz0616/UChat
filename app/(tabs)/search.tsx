import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, View, TextInput } from '../../components/Themed';
import { FIREBASE_DB } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
    fontSize: 18, // Set the font size to make the name larger
    color: '#c2e0fc', // Set the color to blue
    fontWeight: 'bold', // Optionally, you can make the text bold
  },
});

export default function TabOneScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userHobbies, setUserHobbies] = useState<Person[]>([]);

  const fetchData = async () => {
    const users = collection(FIREBASE_DB, 'users');
    const searchTermSplit = searchTerm.split(',').map(term => term.trim()); // TODO: add back in toLowerCase()

    const q = searchTerm == '' ? query(users) : query(users, where('hobbies', 'array-contains-any', searchTermSplit));
    const querySnapshot = await getDocs(q);

    const hobbiesData: Person[] = [];
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      hobbiesData.push({
        uid: user.uid,
        username: user.username,
        hobbies: user.hobbies === null ? ['No Hobbies'] : user.hobbies,
      });
    });

    setUserHobbies(hobbiesData);
  }

  // only fetch all users on initial load
  useEffect(() => {
    fetchData();
  }, []); 

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
          </View>
        )}
        keyExtractor={item => item.uid}
      />
    </View>
  );
}
