import { registerIndieID, unregisterIndieDevice } from 'native-notify';

export const registerUserForNotifications = async (userId: string) => {
    try {
        // console.log(`Registering device for userId: ${userId}`);
        registerIndieID(userId, 31591, 'CFKdEHY835MXsOap4DerLI');
    } catch (error) {
        console.error('Error registering for push notifications:', error);
    }
};

export const unregisterUserFromNotifications = async (userId: string) => {
    try {
        // console.log(`Unregistering device for userId: ${userId}`);
        unregisterIndieDevice(userId, 31591, 'CFKdEHY835MXsOap4DerLI');
    } catch (error) {
        console.error('Error unregistering device:', error);
    }
};
