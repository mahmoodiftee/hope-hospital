import { registerForPushNotificationsAsync, verifyNativeNotifyRegistration } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/sendNotification';
import useAuthStore from '@/store/auth.store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import registerNNPushToken from 'native-notify';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NotificationTestButton = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, dbUser } = useAuthStore();

    const APP_ID = 31591;
    const APP_TOKEN = 'CFKdEHY835MXsOap4DerLI';

    // Register Native Notify hook at component level
    registerNNPushToken(APP_ID, APP_TOKEN);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(logEntry);
        setLogs(prev => [...prev, logEntry]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const testCompleteNotificationFlow = async () => {
        setIsLoading(true);
        clearLogs();

        addLog('🚀 Starting comprehensive notification test for EAS Build...');

        try {
            const currentUserId = user?.id || dbUser?.$id || '68958e6500298253aff8';
            
            // 1. Check device and build info
            addLog(`📱 Device Info:`);
            addLog(`- Is Device: ${Device.isDevice}`);
            addLog(`- Platform: ${Device.osName} ${Device.osVersion}`);
            addLog(`- App Ownership: ${Constants.appOwnership || 'null (EAS Build)'}`);
            addLog(`- Is Dev: ${__DEV__}`);
            addLog(`- Expo SDK Version: ${Constants.expoConfig?.sdkVersion || 'Unknown'}`);
            addLog(`- Project ID: ${Constants.expoConfig?.extra?.eas?.projectId}`);
            addLog(`- Current User ID: ${currentUserId}`);
            addLog(`- Build Profile: ${Constants.appOwnership === null ? 'Standalone APK' : 'Expo Go'}`);

            // 2. Check notification permissions and setup
            addLog('🔐 Setting up notifications...');
            const expoPushToken = await registerForPushNotificationsAsync();
            
            if (expoPushToken) {
                addLog(`✅ Expo Push Token: ${expoPushToken.substring(0, 30)}...`);
            } else {
                addLog('❌ Failed to get push token');
                return;
            }

            // 3. Test local notification
            addLog('📲 Testing local notification...');
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Local Test ✅',
                        body: 'This is a local notification test',
                        data: { test: true, type: 'local' },
                        sound: 'default',
                    },
                    trigger: { 
                        seconds: 1,
                        channelId: 'default'
                    },
                });
                addLog('✅ Local notification scheduled');
            } catch (error: any) {
                addLog(`❌ Local notification failed: ${error.message}`);
            }

            // 4. Wait for Native Notify registration to complete
            addLog('⏳ Waiting 3 seconds for Native Notify registration...');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 5. Verify Native Notify registration
            addLog('🔍 Verifying Native Notify registration...');
            await verifyNativeNotifyRegistration(currentUserId);

            // 6. Test Native Notify push notification
            addLog('📤 Testing Native Notify push notification...');
            try {
                addLog(`🎯 Sending push to user: ${currentUserId}`);
                
                const result = await sendPushToUser({
                    userId: currentUserId,
                    title: 'EAS Build Test 🧪',
                    message: 'This is a test notification for your APK build',
                    data: { test: true, buildType: 'eas-apk' }
                });

                if (result.success) {
                    addLog('✅ Native Notify push sent successfully');
                    addLog(`📨 Server Response: ${JSON.stringify(result.data)}`);
                    addLog('⏰ Check your device for the notification in a few seconds');
                } else {
                    addLog(`❌ Native Notify push failed: ${result.error}`);
                    if (result.details) {
                        addLog(`🔍 Error details: ${JSON.stringify(result.details)}`);
                    }
                }
            } catch (error: any) {
                addLog(`❌ Push notification error: ${error.message}`);
            }

            // 7. Check notification channels (Android only)
            if (Device.osName === 'Android') {
                addLog('🔔 Checking Android notification channels...');
                try {
                    const channels = await Notifications.getNotificationChannelsAsync();
                    addLog(`📋 Found ${channels.length} notification channels:`);
                    channels.forEach(channel => {
                        addLog(`- ${channel.name} (${channel.id}): importance ${channel.importance}`);
                    });
                } catch (error: any) {
                    addLog(`❌ Error checking channels: ${error.message}`);
                }
            }

            // 8. Test direct Expo push (for comparison)
            addLog('🔄 Testing direct Expo push service...');
            try {
                const message = {
                    to: expoPushToken,
                    sound: 'default',
                    title: 'Direct Expo Test 🎯',
                    body: 'This is sent directly to Expo push service',
                    data: { test: 'direct_expo' },
                };

                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });

                const data = await response.json();
                addLog(`📨 Direct Expo response: ${JSON.stringify(data)}`);

                if (data.data?.[0]?.status === 'ok') {
                    addLog('✅ Direct Expo push sent successfully');
                } else {
                    addLog(`❌ Direct Expo push failed: ${data.data?.[0]?.message || 'Unknown error'}`);
                }
            } catch (error: any) {
                addLog(`❌ Direct Expo push error: ${error.message}`);
            }

            // 9. Final recommendations
            addLog('🏁 Test completed!');
            addLog('');
            addLog('📝 Summary:');
            addLog('✓ Native Notify hook registered at component level (fixed hook issue)');
            addLog('✓ Push token obtained and registered');
            addLog('✓ Local and push notifications tested');
            addLog('');
            addLog('🔧 If notifications still not working:');
            addLog('1. Check that google-services.json is in your project root');
            addLog('2. Ensure FCM is properly configured in Firebase Console');
            addLog('3. Try logging out and back in to re-register');
            addLog('4. Check device notification settings for your app');

        } catch (error: any) {
            addLog(`💥 Test failed with error: ${error.message}`);
            addLog(`🔍 Error stack: ${error.stack}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.testButton, isLoading && styles.disabledButton]}
                onPress={testCompleteNotificationFlow}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? '🧪 Running EAS Build Tests...' : '🧪 Test EAS Build Notifications (Fixed)'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
                <Text style={styles.clearButtonText}>🗑️ Clear Logs</Text>
            </TouchableOpacity>

            {Constants.appOwnership === null && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        📱 Running on EAS Build APK - FCM notifications should work
                    </Text>
                </View>
            )}

            {Constants.appOwnership === 'expo' && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ Running in Expo Go - Results may differ from APK
                    </Text>
                </View>
            )}

            <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={true}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText} selectable>
                        {log}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    testButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#D4EDDA',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },
    infoText: {
        color: '#155724',
        fontSize: 14,
        fontWeight: '500',
    },
    warningBox: {
        backgroundColor: '#FFF3CD',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FFC107',
    },
    warningText: {
        color: '#856404',
        fontSize: 14,
        fontWeight: '500',
    },
    logContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 10,
        padding: 15,
        maxHeight: 500,
    },
    logText: {
        color: '#00FF00',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 2,
        lineHeight: 16,
    },
});

export default NotificationTestButton;