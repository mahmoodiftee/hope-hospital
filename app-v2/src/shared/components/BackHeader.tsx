import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BackHeaderProps {
    title: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

export const BackHeader: React.FC<BackHeaderProps> = ({ title, onBack, rightElement }) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={Platform.OS === 'ios' ? "chevron-back" : "arrow-back"}
                        size={24}
                        color="#111827"
                    />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                <View style={styles.rightAction}>
                    {rightElement}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    content: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    titleContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Quicksand-Bold',
        color: '#111827',
        textAlign: 'left',
    },
    rightAction: {
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
