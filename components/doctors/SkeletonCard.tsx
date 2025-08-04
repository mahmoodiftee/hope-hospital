import React from 'react';
import { StyleSheet, View } from 'react-native';

export const SkeletonCard: React.FC = () => (
    <View style={styles.card} className="shadow-lg">
        <View className="flex-row gap-4 items-center mb-2.5">
            <View className="w-24 h-32 rounded-2xl bg-gray-100/20" />
            <View className="flex-1 pt-4">
                <View className="w-32 h-6 rounded-2xl bg-gray-100/20 mb-2" />
                <View className="w-20 h-5 rounded-2xl bg-gray-100/20 mb-1" />
                <View className="w-16 h-5 rounded-2xl bg-gray-100/20" />
            </View>
        </View>
        <View className="flex-row gap-2">
            <View className="flex-1 h-10 bg-gray-100/20 rounded-xl" />
            <View className="flex-1 h-10 bg-gray-100/20 rounded-xl" />
            <View className="w-10 h-10 bg-gray-100/20 rounded-xl" />
        </View>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 10,
        marginBottom: 16,
        marginHorizontal: 16,
    },
});