import axios from 'axios';

export const sendPushToUser = async ({
    userId,
    title,
    message,
}: {
    userId: string;
    title: string;
    message: string;
}) => {
    try {
        const response = await axios.post('https://app.nativenotify.com/api/indie/notification', {
            subID: userId,
            appId: 31591,
            appToken: "CFKdEHY835MXsOap4DerLI",
            title,
            message,
        });

        console.log(`Push sent to ${userId}: ${title} - ${message}`);
        console.log('Native Notify Response:', response.data);
    } catch (error: any) {
        console.error('Error sending push notification:', error?.response?.data || error.message);
    }
};
