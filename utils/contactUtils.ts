// utils/contactUtils.ts
import { Alert, Linking } from 'react-native';
import { hospitalConfig } from '../config/hospitalConfig';

export const contactUtils = {
    handlePhoneCall: (phoneNumber: string) => {
        const url = `tel:${phoneNumber}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Phone calls are not supported on this device');
                }
            })
            .catch((err) => console.error('Error opening phone dialer:', err));
    },

    handleEmailPress: (email: string) => {
        const url = `mailto:${email}`;
        Linking.openURL(url);
    },

    handleMapDirections: () => {
        const { lat, lng } = hospitalConfig.hospital.coordinates;
        const url = `https://maps.google.com/maps?q=${lat},${lng}`;
        Linking.openURL(url);
    },
};