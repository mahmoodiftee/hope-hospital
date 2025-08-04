import React from 'react';
import { Alert, Button } from 'react-native';

type Props = {
    token: string | null;
};

const sendTestNotification = async (token: string) => {
    try {
        const res = await fetch('https://882dc0c8de8b.ngrok-free.app/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                expoPushToken: token,
                title: 'Test Notification',
                body: 'Push notification working!',
                data: { screen: 'appointments' },
            }),
        });

        if (res.ok) {
            Alert.alert('✅ Notification sent');
        } else {
            Alert.alert('❌ Failed to send notification');
        }
    } catch (err) {
        console.error('Error:', err);
        Alert.alert('❌ Error sending notification');
    }
};

export default function TestNotification({ token }: Props) {

    return (
        <Button
            title="Send Test Notification"
            disabled={!token}
            onPress={() => {
                if (token) sendTestNotification(token);
            }}
        />
    );
}
