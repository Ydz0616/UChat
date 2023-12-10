import React, { useEffect, useState } from 'react';
import { StyleSheet, Button, Alert, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, FlatList, Pressable } from 'react-native';
import { Text, TextInput, View, DropDownPicker } from '../../components/Themed';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { collection, serverTimestamp, addDoc, query, where, onSnapshot } from 'firebase/firestore';


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

  const [userRequests, setUserRequests] = useState<any[]>([])
  const [showReports, setShowReports] = useState(false)

  const user = FIREBASE_AUTH.currentUser;

  const fetchData = async () => {
    setUserRequests([])
    try {
      const notificationsRef = collection(FIREBASE_DB, 'reports');
      const queryRef = query(notificationsRef, where('reporter', '==', user!.uid));

      const eventlistener = onSnapshot(queryRef, (querySnapshot) => {
        let updatedRequests: any[] = [];

        querySnapshot.forEach((doc) => {
          const request = doc.data() as any; // Type assertion
          console.log('Req:', request)
          updatedRequests.push(request);
        });

        setUserRequests(updatedRequests);
        console.log('REQUESTS:', updatedRequests)
      });
      return () => {
        // Unsubscribe from the snapshot listener when component unmounts
        eventlistener();
      };
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
          status: 'in review',
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
          status: 'in review',
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
    <View style={styles.container}>
      {showReports ?
        <View style={{ flex: 1 }}>
          <Button title='Close Reports' onPress={() => setShowReports(false)} />
          {userRequests.length > 0 ?
            <FlatList
              data={userRequests}
              keyExtractor={item => item?.type + item?.receiver + item?.sender}
              renderItem={({ item }) => (
                <View style={styles.resultContainer}>
                  {/* TODO: account for other notification types */}
                    <>
                      <Text style={styles.header}>Category: {item.category}</Text>
                      <Text style={styles.description}>Description: {item.description}</Text>
                      <Text style={styles.description2}>Status: {item.status}</Text>
                    </>
                </View>
              )}
            />
            : <Text style={styles.modalText}>No reports submitted yet</Text>}
        </View>
        :
        <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={100}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.container}>
              <Button title='View Reports' onPress={() => setShowReports(true)} />
              <View style={{ height: 10, paddingTop: 40 }} />
              <Text style={styles.header}>Report User</Text>
              <TextInput
                style={styles.input}
                placeholder='Username'
                value={reportUser}
                onChangeText={setReportUser} />
              <View style={{ height: 10 }} />
              <DropDownPicker
                open={reportCategoryOpen}
                placeholder='Category'
                value={reportCategory}
                items={reportCategories}
                setOpen={setReportCategoryOpen}
                setValue={setReportCategory}
                setItems={setReportCategories}
                style={[styles.drowpdown, { alignSelf: 'center' }]}
              />
              <View style={{ height: 10 }} />
              <TextInput
                multiline={true}
                numberOfLines={4}
                style={styles.input}
                placeholder='What should we know?'
                value={reportDescription}
                onChangeText={setReportDescription} />
              <View style={{ height: 10 }} />
              <Button title='Submit Report' onPress={handleReportSubmit} />
              <View style={{ height: 20 }} />

              <Text style={styles.header}>Contact Developers</Text>
              <View style={{ height: 10 }} />
              <DropDownPicker
                open={contactCategoryOpen}
                placeholder='Category'
                value={contactCategory}
                items={contactCategories}
                setOpen={setContactCategoryOpen}
                setValue={setContactCategory}
                setItems={setContactCategories}
                style={[styles.drowpdown, { alignSelf: 'center' }]}
              />
              <View style={{ height: 10 }} />
              <TextInput
                multiline={true}
                numberOfLines={4}
                style={styles.input}
                placeholder='Please include as much information as possible'
                value={contactDescription}
                onChangeText={setContactDescription} />
              <View style={{ height: 10 }} />
              <Button title='Send' onPress={handleContactSubmit} />
              <View style={{ height: 10 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
  description2: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'gray',
  },
  input: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    padding: 5,
    marginTop: 15,
    marginBottom: 10,
    width: 250,
  },
  drowpdown: {
    borderWidth: 1,
    borderColor: 'gray',
    width: 250,
  },
  button: {
    marginTop: 15,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  resultContainer: {
    marginTop: 8,
  },
});
