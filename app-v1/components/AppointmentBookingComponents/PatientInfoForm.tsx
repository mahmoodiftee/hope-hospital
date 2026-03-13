import useAuthStore from '@/store/auth.store';
import { Calendar as CalendarIcon, Phone, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PatientInfo } from '../../types';

type PatientInfoFormProps = {
    patientInfo: {
        name: string;
        age: string;
        phone: string;
    };
    validationErrors: {
        name: string;
        age: string;
        phone: string;
    };
    onPatientInfoChange: (field: keyof PatientInfo, value: string) => void;
    disabled?: boolean; 
};

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
    patientInfo,
    validationErrors,
    onPatientInfoChange,
    disabled = false
}) => {
    const { user, dbUser } = useAuthStore();
    
    const userPhone = user?.phone || dbUser?.phone || '';
    
    useEffect(() => {
        if (userPhone && !patientInfo.phone) {
            onPatientInfoChange('phone', userPhone);
        }
    }, [userPhone, patientInfo.phone, onPatientInfoChange]);

    return (
        <View className="mx-4 my-2 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-lg font-semibold text-dark-100 mb-4">Patient Information</Text>

            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Patient Name <Text className='text-red-500'>*</Text></Text>
                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${validationErrors.name ? 'border border-red-500' : ''}`}>
                    <User size={20} color="#6B7280" />
                    <TextInput
                        className="pl-3 w-full h-8"
                        placeholder="Enter patient name"
                        value={patientInfo.name}
                        editable={!disabled}
                        onChangeText={(value) => onPatientInfoChange('name', value)}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                {validationErrors.name && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">{validationErrors.name}</Text>
                )}
            </View>

            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Patient Age <Text className='text-red-500'>*</Text></Text>
                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${validationErrors.age ? 'border border-red-500' : ''}`}>
                    <CalendarIcon size={20} color="#6B7280" />
                    <TextInput
                        className="pl-3 w-full h-8"
                        placeholder="Enter age"
                        value={patientInfo.age}
                        editable={!disabled}
                        onChangeText={(value) => onPatientInfoChange('age', value)}
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                {validationErrors.age && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">{validationErrors.age}</Text>
                )}
            </View>

            <View className="mb-2">
                <Text className="text-sm font-medium text-gray-600 mb-2">
                    Phone Number <Text className='text-red-500'>*</Text>
                </Text>
                <View className={`flex-row items-center bg-white rounded-xl px-4 py-3 ${validationErrors.phone ? 'border border-red-500' : ''}`}>
                    <Phone size={20} color="#6B7280" />
                    <TextInput
                        className="pl-3 w-full h-8"
                        placeholder="Enter phone number"
                        value={patientInfo.phone} // Always use patientInfo.phone
                        editable={!userPhone || !disabled} // Disable if user is logged in AND form is disabled
                        onChangeText={(value) => onPatientInfoChange('phone', value)}
                        keyboardType="phone-pad"
                        placeholderTextColor="#9CA3AF"
                        maxLength={11}
                    />
                </View>
                {validationErrors.phone && (
                    <Text className="text-red-500 text-sm mt-1 ml-1">{validationErrors.phone}</Text>
                )}
            </View>
        </View>
    );
};

export default PatientInfoForm;