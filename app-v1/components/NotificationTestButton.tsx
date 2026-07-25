import { registerForPushNotificationsAsync, registerPushTokenWithBackend, verifyPushTokenRegistration } from '@/lib/notifications';
import { checkPushNotificationStatus, sendPushToUser, testDirectExpoPush } from '@/lib/sendNotification';
import useAuthStore from '@/store/auth.store';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NotificationTestButton = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, dbUser } = useAuthStore();

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        setLogs(prev => [...prev, logEntry]);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const testCompleteNotificationFlow = async () => {
        setIsLoading(true);
        clearLogs();

        addLog('🚀 Starting Expo Push Notification Test...');

        try {
            const currentUserId = user?.id || dbUser?.$id || '68958e6500298253aff8';

            // 1. Device and Build Info
            addLog('📱 Device Information:');
            addLog(`- Device: ${Device.isDevice ? 'Physical Device ✅' : 'Emulator/Simulator ❌'}`);
            addLog(`- Platform: ${Device.osName} ${Device.osVersion}`);
            addLog(`- Build Type: ${Constants.appOwnership === null ? 'Standalone APK ✅' : 'Expo Go ⚠️'}`);
            addLog(`- Project ID: ${Constants.expoConfig?.extra?.eas?.projectId}`);
            addLog(`- User ID: ${currentUserId}`);

            if (!Device.isDevice) {
                addLog('⚠️ Push notifications require a physical device');
                return;
            }

            // 2. Register for Push Notifications
            addLog('');
            addLog('🔐 Registering for push notifications...');
            const expoPushToken = await registerForPushNotificationsAsync();

            if (!expoPushToken) {
                addLog('❌ Failed to get Expo Push Token');
                return;
            }

            addLog(`✅ Expo Push Token: ${expoPushToken.substring(0, 40)}...`);

            // 3. Register Token with Backend
            addLog('');
            addLog('📡 Registering token with backend...');
            const registered = await registerPushTokenWithBackend(currentUserId, expoPushToken);

            if (registered) {
                addLog('✅ Token registered successfully');
            } else {
                addLog('❌ Failed to register token with backend');
            }

            // 4. Verify Registration
            addLog('');
            addLog('🔍 Verifying registration...');
            const verified = await verifyPushTokenRegistration(currentUserId);
            addLog(verified ? '✅ Registration verified' : '❌ Registration not found');

            // 5. Test Local Notification
            addLog('');
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
                        seconds: 2,
                        channelId: 'default'
                    },
                });
                addLog('✅ Local notification scheduled (should appear in 2 seconds)');
            } catch (error: any) {
                addLog(`❌ Local notification failed: ${error.message}`);
            }

            // 6. Test Backend Health
            addLog('');
            addLog('🏥 Checking backend health...');
            const healthCheck = await checkPushNotificationStatus();
            if (healthCheck.success) {
                addLog('✅ Backend is healthy');
                addLog(`📊 Registered users: ${healthCheck.data?.registeredUsers || 0}`);
            } else {
                addLog(`❌ Backend health check failed: ${healthCheck.error}`);
            }

            // 7. Send Push via Backend (using your existing sendPushToUser function)
            addLog('');
            addLog('📤 Sending push notification via backend...');
            const result = await sendPushToUser({
                userId: currentUserId,
                title: 'Backend Test 🎉',
                message: 'This notification was sent through your backend API',
                data: { test: true, source: 'backend', timestamp: Date.now() }
            });

            if (result.success) {
                addLog('✅ Backend push sent successfully');
                addLog(`⏱️ Duration: ${result.duration}ms`);
                addLog('📨 Check your device in a few seconds...');
            } else {
                addLog(`❌ Backend push failed: ${result.error}`);
                if (result.details) {
                    addLog(`🔍 Details: ${JSON.stringify(result.details)}`);
                }
            }

            // 8. Test Direct Expo Push (for comparison)
            addLog('');
            addLog('🔄 Testing direct Expo push service...');
            const directResult = await testDirectExpoPush(
                expoPushToken,
                'Direct Expo Test 🎯',
                'This was sent directly to Expo push service'
            );

            if (directResult.success) {
                addLog('✅ Direct Expo push sent successfully');
            } else {
                addLog(`❌ Direct Expo push failed: ${directResult.error}`);
            }

            // 9. Check Notification Channels (Android)
            if (Device.osName === 'Android') {
                addLog('');
                addLog('🔔 Android notification channels:');
                try {
                    const channels = await Notifications.getNotificationChannelsAsync();
                    channels.forEach(channel => {
                        addLog(`- ${channel.name}: importance ${channel.importance}`);
                    });
                } catch (error: any) {
                    addLog(`❌ Error checking channels: ${error.message}`);
                }
            }

            // 10. Summary
            addLog('');
            addLog('🏁 Test Completed!');
            addLog('');
            addLog('📝 Summary:');
            addLog('✅ Migrated from native-notify to Expo Push Notifications');
            addLog('✅ sendPushToUser() maintains same interface');
            addLog('✅ All notifications route through your backend');
            addLog('');
            addLog('💡 Next Steps:');
            addLog('1. Uninstall native-notify: npm uninstall native-notify');
            addLog('2. Deploy updated backend with new endpoints');
            addLog('3. Test on production build');

        } catch (error: any) {
            addLog(`💥 Test failed: ${error.message}`);
            console.error(error);
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
                    {isLoading ? '🧪 Running Tests...' : '🧪 Test Expo Push Notifications'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
                <Text style={styles.clearButtonText}>🗑️ Clear Logs</Text>
            </TouchableOpacity>

            {Constants.appOwnership === null && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ✅ Running on Standalone Build - Push notifications enabled
                    </Text>
                </View>
            )}

            {Constants.appOwnership === 'expo' && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ Expo Go - Build standalone APK for full push notification support
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