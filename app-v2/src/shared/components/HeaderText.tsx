import { View, Text } from 'react-native'
import React from 'react'

const HeaderText = ({ title }: { title: string }) => {
    return (
        <View className="mb-4">
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
        </View>
    )
}

export { HeaderText }
