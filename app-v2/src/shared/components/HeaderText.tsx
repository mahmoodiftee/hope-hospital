import { View, Text } from 'react-native'
import React from 'react'
import { getTypographyStyle } from '@/shared/utils/typography';

const HeaderText = ({ title, className }: { title: string; className?: string }) => {
    return (
        <View className={className !== undefined ? className : "mb-4"}>
            <Text
                className="text-xl text-gray-800"
                style={getTypographyStyle('bold', 20)}
            >
                {title}
            </Text>
        </View>
    );
};

export { HeaderText }
