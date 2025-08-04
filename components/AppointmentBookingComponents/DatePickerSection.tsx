import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DatePickerSectionProps {
    selectedDate: string;
    validationErrors: {
        date: string;
    };
    markedDates: any;
    today: string;
    onDateSelect: (day: any) => void;
}

const DatePickerSection: React.FC<DatePickerSectionProps> = ({
    selectedDate,
    validationErrors,
    markedDates,
    today,
    onDateSelect,
}) => {
    const getFormattedDate = () => {
        if (!selectedDate) return 'Select a date';
        return new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <View className="px-4 py-3">
                <Text className="text-lg font-semibold text-dark-100 mb-4 px-2">Select Date</Text>
                <Calendar
                    onDayPress={onDateSelect}
                    markedDates={markedDates}
                    minDate={today}
                    markingType="custom"
                    style={{
                        borderWidth: 2,
                        borderColor: '#f2f3f4',
                        borderRadius: 16,
                        height: 350,
                    }}
                    theme={{
                        arrowColor: '#007AFF',
                        textSectionTitleColor: '#b6c1cd',
                        selectedDotColor: '#007AFF',
                        selectedDayBackgroundColor: '#007AFF',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#007AFF',
                        todayBackgroundColor: '#E0F2FF',
                        todayButtonFontWeight: '800',
                        dayTextColor: '#000000',
                        textDisabledColor: '#878787'
                    }}
                />
                {validationErrors.date && (
                    <Text className="text-red-500 text-sm mt-2 ml-2">{validationErrors.date}</Text>
                )}
            </View>

            {selectedDate && (
                <View className="px-6 py-4 mx-4 bg-green-50 rounded-lg border border-green-100">
                    <Text className="text-sm text-green-600 font-semibold mb-1">Selected Date</Text>
                    <Text className="text-base font-semibold text-green-900">{getFormattedDate()}</Text>
                </View>
            )}
        </>
    );
};

export default DatePickerSection;