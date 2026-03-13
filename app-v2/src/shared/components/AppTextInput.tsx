import { TextInput } from "react-native";

export const AppTextInput = ({ containerStyle, ...props }: any) => (
    <TextInput
        selectionColor="#3B82F6"
        placeholderTextColor="#9CA3AF"
        style={[{
            fontFamily: 'Quicksand-Bold',
            fontSize: 16,
            color: '#111827',
            paddingHorizontal: 16,
            height: 64,
            paddingVertical: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
        }, containerStyle]}
        {...props}
    />
);