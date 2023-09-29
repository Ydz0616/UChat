import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList } from 'react-native';
import { Text, View } from '../../components/Themed';

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
  const [data, setData] = useState([
    { id: '1', name: 'Bloated Giraffe', hobbies: ['Reading', 'Swimming', 'Gardening', 'Cooking'] },
  { id: '2', name: 'Diseased Wart', hobbies: ['Traveling', 'Cooking', 'Painting', 'Coding'] },
  { id: '3', name: 'Enigmatic Tornado', hobbies: ['Hiking', 'Photography', 'Fishing', 'Dancing'] },
  { id: '4', name: 'Dead Dog', hobbies: ['Writing', 'Traveling', 'Singing', 'Gaming'] },
  { id: '5', name: 'Buttered Fly', hobbies: ['Swimming', 'Cooking', 'Reading', 'Cycling'] },
  { id: '6', name: 'Mysterious Ball', hobbies: ['Painting', 'Reading', 'Cooking', 'Gardening'] },
  { id: '7', name: 'Ugly Person', hobbies: ['Gaming', 'Coding', 'Traveling', 'Hiking'] },
  { id: '8', name: 'THe the', hobbies: ['Dancing', 'Singing', 'Writing', 'Traveling'] },
  { id: '9', name: 'Plastic Otter', hobbies: ['Fishing', 'Cycling', 'Photography', 'Reading'] },
  { id: '10', name: 'Camping Guy', hobbies: ['Cooking', 'Painting', 'Traveling', 'Writing'] },
    // Add more data objects as needed
  ]);
  const searchTermSplit = searchTerm.split(',').map(term => term.toLowerCase().trim());

  const filteredData = searchTerm == '' ? data : data.filter(item => {
    const hobbies = item.hobbies.map(hobby => hobby.toLowerCase());
    // return hobbies.includes(searchTerm.toLowerCase());
    return searchTermSplit.some(term => hobbies.some(hobby => term != '' && hobby.startsWith(term))); // replaced with db query?
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by hobby"
        onChangeText={setSearchTerm}
        value={searchTerm}
      />
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <View style={styles.resultContainer}>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text>{item.hobbies.join(', ')}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
