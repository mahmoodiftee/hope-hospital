import { View, Text } from 'react-native'
import React from 'react'

const HeaderText = ({ title, className }: { title: string; className?: string }) => {
    return (
        <View className={className !== undefined ? className : "mb-4"}>
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
        </View>
    );
};

export { HeaderText }
