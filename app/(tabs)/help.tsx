import React, { useState } from 'react';
import { StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { Text, TextInput, View } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';


export default function TabOneScreen() {
  const [reportUser, setReportUser] = useState('');
  const [reportDescription, setReportDescription] = useState('')
  const [reportCategoryOpen, setReportCategoryOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState(null);
  const [reportCategories, setReportCategories] = useState([
    { label: 'Sexual Harassment', value: 'sexual harassment' },
    { label: 'Inappropriate Language or Content', value: 'inappropriate language or content' },
    { label: 'Stalking or Harassment', value: 'stalking or harassment' },
    { label: 'Cyberbullying', value: 'cyberbullying' },
    { label: 'Discrimination or Hate Speech', value: 'discrimination or hate speech' },
    { label: 'Other', value: 'other' },
  ]);

  const [contactDescription, setContactDescription] = useState('')
  const [contactCategoryOpen, setContactCategoryOpen] = useState(false);
  const [contactCategory, setContactCategory] = useState(null);
  const [contactCategories, setContactCategories] = useState([
    { label: 'Bug Report', value: 'bug report' },
    { label: 'Feature Fequest', value: 'feature request' },
    { label: 'App Performance Issues', value: 'app performance issues' },
    { label: 'Security/Privacy Concerns', value: 'security/privacy concerns' },
    { label: 'General Feedback', value: 'general feedback' },
    { label: 'Other', value: 'other' },
  ]);

  const user = FIREBASE_AUTH.currentUser;

  const handleReportSubmit = async () => {
    if (!reportUser || !reportCategory || !reportDescription) {
      Alert.alert("Please fill in all fields for report", "We need all information in order to properly handle the situation.", [
        { text: "Understood" }
      ]);
    }

    if (user) {
      try {
        await addDoc(collection(FIREBASE_DB, 'reports'), {
          reporter: user?.uid,
          reportee: reportUser,
          category: reportCategory,
          description: reportDescription,
          timestamp: serverTimestamp(),
        });
        Alert.alert('Submitted', 'Thank you for sharing this with us. We will be sure to look carefully into this situation and take the appropriate action.')
        setReportUser('')
        setReportCategory(null)
        setReportDescription('')
      } catch (error) {
        console.error('error submitting report:', error)
      }
    } else {
      console.log("User not signed in.");
    }

  }

  const handleContactSubmit = async () => {
    if (!contactCategory || !contactDescription) {
      Alert.alert("Missing information for contact", "Please be sure that you have selected a category and added a description.", [
        { text: "Will do" }
      ]);
    }

    if (user) {
      try {
        await addDoc(collection(FIREBASE_DB, 'contacts'), {
          user: user?.uid,
          category: contactCategory,
          description: contactDescription,
          timestamp: serverTimestamp(),
        });
        Alert.alert('We appreciate your feedback', 'Thank you for sharing this with us. We will be sure to properly handle this situation.')
        setContactCategory(null)
        setContactDescription('')
      } catch (error) {
        console.error('error submitting contact:', error)
      }
    } else {
      console.log("User not signed in.");
    }

  }

  return (
    <ScrollView contentContainerStyle={[{flex:1, alignItems:'center', justifyContent: 'space-around' }]}>
      <View style={styles.container}>
        <Text style={styles.header}>Report User</Text>
        <TextInput
          style={styles.input}
          placeholder='Username'
          value={reportUser}
          onChangeText={setReportUser} />
        <DropDownPicker
          open={reportCategoryOpen}
          placeholder='Category'
          value={reportCategory}
          items={reportCategories}
          setOpen={setReportCategoryOpen}
          setValue={setReportCategory}
          setItems={setReportCategories}
          style={[styles.input, { alignSelf: 'center' }]}
        />
        <TextInput
          multiline={true}
          numberOfLines={4}
          style={styles.input}
          placeholder='What should we know?'
          value={reportDescription}
          onChangeText={setReportDescription} />

        <Button title='Submit Report' onPress={handleReportSubmit} />
      </View>


      <View style={styles.container}>
        <Text style={styles.header}>Contact Developers</Text>
        <DropDownPicker
          open={contactCategoryOpen}
          placeholder='Category'
          value={contactCategory}
          items={contactCategories}
          setOpen={setContactCategoryOpen}
          setValue={setContactCategory}
          setItems={setContactCategories}
          style={[styles.input, { alignSelf: 'center' }]}
        />
        <TextInput
          multiline={true}
          numberOfLines={4}
          style={styles.input}
          placeholder='Please include as much information as possible'
          value={contactDescription}
          onChangeText={setContactDescription} />
        <Button title='Send' onPress={handleContactSubmit} />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    width: '100%'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    padding: 5,
    marginTop: 15,
    marginBottom: 10,
    width: 250,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
});
