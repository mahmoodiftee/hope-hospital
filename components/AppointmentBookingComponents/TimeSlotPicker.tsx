import { TimeSlot } from '@/types';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


interface TimeSlotPickerProps {
    selectedTime: string;
    validationErrors: {
        time: string;
    };
    timeSlots: TimeSlot[];
    onTimeSelect: (time: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    selectedTime,
    validationErrors,
    timeSlots,
    onTimeSelect,
}) => {
    // console.log(JSON.stringify(timeSlots, null, 2));

    return (
        <>
            <View className="p-5">
                <Text className="text-lg font-semibold text-dark-100 mb-4">Select Time</Text>
                <View className="my-1 py-3 rounded-lg">
                    <View className="flex-row flex-wrap gap-4">
                        <View className="flex-row items-center">
                            <View className="w-4 h-4 bg-green-50 border border-green-400 rounded mr-2" />
                            <Text className="text-sm font-medium text-green-700">Available</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-4 h-4 bg-red-50 border border-red-400 rounded mr-2" />
                            <Text className="text-sm font-medium text-red-600">Time Passed</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-4 h-4 bg-gray-50 border border-gray-400 rounded mr-2" />
                            <Text className="text-sm font-medium text-gray-600">Not Available</Text>
                        </View>
                    </View>
                </View>
                <View className="flex-row flex-wrap justify-between gap-2.5">
                    {timeSlots.map((slot) => {
                        const isPassed = slot.status === 'time_passed';
                        const isNotAvailable = slot.status === 'not_available';
                        const isAvailable = slot.status === 'available';

                        return (
                            <TouchableOpacity
                                key={slot.id}
                                className={`w-[48%] py-3 px-4 border rounded-lg items-center mb-2.5
                ${isNotAvailable
                                        ? 'bg-slate-100/50 border-gray-300'
                                        : isPassed
                                            ? 'bg-red-50 border-red-100'
                                            : selectedTime === slot.time
                                                ? 'bg-green-100 border-green-500'
                                                : 'bg-green-50 border-green-100'
                                    }`}
                                onPress={() => isAvailable && onTimeSelect(slot.time)}
                                disabled={!isAvailable}
                            >
                                <Text
                                    className={`text-sm font-medium
                    ${isNotAvailable
                                            ? 'text-gray-400'
                                            : isPassed
                                                ? 'text-red-500'
                                                : selectedTime === slot.time
                                                    ? 'text-green-800 font-semibold'
                                                    : 'text-green-600'
                                        }`}
                                >
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                </View>
                {validationErrors.time && (
                    <Text className="text-red-500 text-sm mt-2">{validationErrors.time}</Text>
                )}
            </View>

            {selectedTime && (
                <View className="px-6 py-4 mx-4 bg-green-50 rounded-lg border border-green-100">
                    <Text className="text-sm text-green-600 font-medium mb-1">Selected Time</Text>
                    <Text className="text-base font-semibold text-green-900">{selectedTime}</Text>
                </View>
            )}
        </>
    );
};

export default TimeSlotPicker;