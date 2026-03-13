import { PhoneCall } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActionButtonsProps {
  onBookNow: () => void;
  onCall?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onBookNow, onCall }) => (
  <View className="bg-white px-6 py-6">
    <View className="flex-row gap-4">
      <TouchableOpacity
        className="flex-1 bg-blue py-4 rounded-xl items-center justify-center"
        onPress={onBookNow}
      >
        <Text className="text-white text-lg font-semibold">Book Now</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 bg-white py-4 border border-gray-100/50 rounded-xl flex-row items-center justify-center gap-2"
        onPress={onCall}
      >
        <PhoneCall size={18} color="#007AFF" strokeWidth={2} />
        <Text className="text-dark-100 text-lg font-semibold">Call</Text>
      </TouchableOpacity>
    </View>
  </View>
);