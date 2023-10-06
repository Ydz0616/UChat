import React from 'react'
import { Alert, Button } from 'react-native'
import { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

interface ResetPasswordProps {
    text: string;
    email: string;
}

export default function ResetPassword(props: ResetPasswordProps) {
    const { text, email } = props;

    const auth = FIREBASE_AUTH;

    const handleResetPassword = () => {
        Alert.alert('Reset Password', `Would you like to reset your password? You will receive an email at '${email}' with a link to reset your password.`, [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Reset',
                onPress: resetPassword
            },
        ]);
    };

    const resetPassword = async () => {
        try {
            await sendPasswordResetEmail(FIREBASE_AUTH, email)
            Alert.alert('Password Reset Email Sent', `An email has been sent to '${email}' with a link to reset your password.`);
        } catch (error: any) {
            if (error.code === 'auth/invalid-email') {
                Alert.alert('Invalid Email', `The email address '${email}' is invalid. Please try again.`);
            }
            else {
                Alert.alert('Password Reset Error', 'There was an error resetting your password. Please try again.');
            }
        }
    }

    return (
        <Button
            title={text}
            onPress={handleResetPassword}
        />
    );
}