import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface SuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-2xl">
                    <View className="w-20 h-20 bg-green-100 rounded-full justify-center items-center mb-6">
                        <CheckCircle size={48} color="#10B981" />
                    </View>

                    <Text className="text-2xl font-bold text-dark-100 mb-3 text-center">
                        Booking Request Submitted!
                    </Text>

                    <Text className="text-base text-gray-600 text-center leading-6 mb-8">
                        Shortly you will receive a text message on your device with booking details.
                    </Text>

                    <TouchableOpacity
                        className="w-full bg-green-500 py-4 rounded-xl items-center"
                        onPress={onClose}
                        style={{
                            shadowColor: '#10B981',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Text className="text-white text-lg font-semibold">Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SuccessModal;