import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

/**
 * Download and apply an EAS Update if one is available.
 * No-op in Metro (__DEV__), on web, or when updates are disabled.
 */
export async function applyOtaUpdateIfAvailable(): Promise<void> {
    if (__DEV__ || Platform.OS === 'web' || !Updates.isEnabled) return;

    try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) return;

        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
    } catch (error) {
        console.warn('[updates] check/apply failed:', error);
    }
}
