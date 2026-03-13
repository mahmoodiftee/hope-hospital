import React, { useRef } from 'react';
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

interface OtpInputProps {
    value: string[];
    onChange: (value: string, index: number) => void;
    error?: boolean;
}

/**
 * OtpInput — a 6-digit OTP input component with auto-focus and backspace handling.
 * This is a shared component used in both login and booking flows.
 */
export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, error }) => {
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleTextChange = (text: string, index: number) => {
        // Only allow single digit
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        onChange(digit, index);

        // Auto-focus next input
        if (digit && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        // Handle backspace when input is empty
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View className="flex-row justify-between w-full px-4 mb-6">
            {value.map((digit, index) => (
                <View
                    key={index}
                    className={`w-12 h-14 border-2 rounded-xl justify-center items-center ${error ? 'border-red-500' : digit ? 'border-blue-500' : 'border-gray-200'
                        }`}
                >
                    <TextInput
                        ref={(ref) => { inputs.current[index] = ref; }}
                        className="text-2xl font-bold text-center w-full"
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleTextChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        placeholder="0"
                        placeholderTextColor="#D1D5DB"
                    />
                </View>
            ))}
        </View>
    );
};


