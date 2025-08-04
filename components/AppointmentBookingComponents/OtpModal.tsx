import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';

interface OtpModalProps {
    visible: boolean;
    otp: string[];
    otpError: string;
    otpLoading: boolean;
    resendLoading: boolean;
    countdown: number;
    canResend: boolean;
    isOtpComplete: boolean;
    phone: string;
    inputRefs: React.RefObject<TextInput>[];
    onOtpChange: (text: string, index: number) => void;
    onKeyPress: (e: any, index: number) => void;
    onResendOtp: () => void;
    onOtpVerification: () => void;
    onClose: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
    visible,
    otp,
    otpError,
    otpLoading,
    resendLoading,
    countdown,
    canResend,
    isOtpComplete,
    phone,
    inputRefs,
    onOtpChange,
    onKeyPress,
    onResendOtp,
    onOtpVerification,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold text-dark-100">
                            Enter Your OTP
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1"
                        >
                            <X color="#6B7280" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text className="text-dark-100/50 text-center mb-6 leading-5">
                        Code sent to {phone}
                    </Text>

                    {/* Individual OTP Input Boxes */}
                    <View className="flex-row justify-center gap-1 mb-6">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                value={digit}
                                onChangeText={(text) => onOtpChange(text.replace(/[^0-9]/g, ''), index)}
                                onKeyPress={(e) => onKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                className="w-12 h-14 border-2 border-dark-100/10 rounded-lg text-center text-2xl font-medium bg-slate-100 text-dark-100"
                                selectionColor="#007AFF"
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    {/* Error Message */}
                    {otpError && (
                        <Text className="text-red-500 text-sm mb-4 text-center">
                            {otpError}
                        </Text>
                    )}

                    {/* Resend Timer */}
                    <View className="items-center mb-6">
                        {canResend ? (
                            <TouchableOpacity
                                onPress={onResendOtp}
                                disabled={resendLoading}
                                className="py-2 px-4 rounded-lg"
                            >
                                {resendLoading ? (
                                    <View className="flex-row items-center">
                                        <ActivityIndicator size="small" color="#22c55e" />
                                        <Text className="text-blue font-medium ml-2">
                                            Sending...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-dark-100/50 font-medium">
                                        Didn&apos;t receive the code? <Text className="text-blue font-medium">Resend</Text>
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View className="items-center">
                                <Text className="text-gray-400 text-sm">
                                    Resend code in {countdown} s
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        className={`w-full py-4 rounded-xl items-center ${otpLoading || !isOtpComplete
                            ? 'bg-gray-600'
                            : 'bg-blue'
                            }`}
                        onPress={onOtpVerification}
                        disabled={otpLoading || !isOtpComplete}
                        style={{
                            shadowColor: otpLoading || !isOtpComplete ? 'transparent' : '#007AFF',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: otpLoading || !isOtpComplete ? 0 : 0.3,
                            shadowRadius: 8,
                            elevation: otpLoading || !isOtpComplete ? 0 : 6,
                        }}
                    >
                        {otpLoading ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator color="#fff" />
                                <Text className="text-white font-semibold text-lg ml-2">
                                    Verifying...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white font-semibold text-lg">
                                Verify & Book Appointment
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default OtpModal;