import React from 'react';
import { Text } from 'react-native';

interface HeaderTextProps {
    title: string;
}

const HeaderText: React.FC<HeaderTextProps> = ({ title }) => {
    return (
        <Text className="text-dark-100 text-lg font-bold mb-2">
            {title}
        </Text>
    );
};

export default HeaderText;
