import React from 'react'
import { Alert, Button } from 'react-native'
import { router } from 'expo-router';
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

interface SignOutProps {
    text: string;
}

export default function SignOut(props: SignOutProps) {
    const { text } = props;

    const auth = FIREBASE_AUTH;

    const handleSignOut = () => {
        Alert.alert('Sign Out', `Are you sure you want to sign out?`, [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Sign Out',
                onPress: signOutFirebase
            },
        ]);
    };

    const signOutFirebase = async () => {
        try {
            await signOut(FIREBASE_AUTH)
            router.replace('/')
        } catch (error: any) {
            Alert.alert('Sign Out Error', 'There was an error signing you out. Please try again.');
        }
    }

    return (
        <Button
            title={text}
            color='red'
            onPress={handleSignOut}
        />
    );
}