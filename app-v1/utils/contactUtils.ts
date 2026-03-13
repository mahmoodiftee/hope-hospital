// utils/contactUtils.ts
import { Alert, Linking, Platform } from 'react-native';
import { hospitalConfig } from '../config/hospitalConfig';

export const contactUtils = {
    handlePhoneCall: (phoneNumber: string) => {
        const url = `tel:${phoneNumber}`;
        
        // For production builds, we can skip the canOpenURL check and try directly
        if (Platform.OS === 'android') {
            Linking.openURL(url).catch((err) => {
                console.error('Error opening phone dialer:', err);
                Alert.alert('Error', 'Unable to open phone dialer');
            });
        } else {
            // For iOS, keep the original logic
            Linking.canOpenURL(url)
                .then((supported) => {
                    if (supported) {
                        Linking.openURL(url);
                    } else {
                        Alert.alert('Error', 'Phone calls are not supported on this device');
                    }
                })
                .catch((err) => {
                    console.error('Error opening phone dialer:', err);
                    Alert.alert('Error', 'Unable to open phone dialer');
                });
        }
    },

    handleEmailPress: (email: string) => {
        const url = `mailto:${email}`;
        Linking.openURL(url).catch((err) => {
            console.error('Error opening email client:', err);
            Alert.alert('Error', 'Unable to open email client');
        });
    },

    handleMapDirections: () => {
        const { lat, lng } = hospitalConfig.hospital.coordinates;
        const url = `https://maps.google.com/maps?q=${lat},${lng}`;
        Linking.openURL(url).catch((err) => {
            console.error('Error opening maps:', err);
            Alert.alert('Error', 'Unable to open maps');
        });
    },
};