import React from 'react';
import { View, Button, Alert } from 'react-native';

export default function TestConnection() {
    const testFetch = async () => {
        try {
            const res = await fetch('https://fce8a93e2e94.ngrok-free.app/health');
            const data = await res.json();
            Alert.alert('Success', JSON.stringify(data));
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={{ marginTop: 50 }}>
            <Button title="Test Backend Connection" onPress={testFetch} />
        </View>
    );
}
