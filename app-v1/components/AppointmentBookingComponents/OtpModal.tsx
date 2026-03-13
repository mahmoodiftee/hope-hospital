import { X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    inputRefs: React.RefObject<(TextInput | null)[]>;
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
            <View className="flex-1 bg-black/50 justify-center items-center px-6 mb-20">
                <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                    <TouchableOpacity
                        onPress={onClose}
                        className="p-1 absolute top-3 right-3"
                    >
                        <X color="#6B7280" size={24} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-dark-100 text-center mb-1">
                        Enter Your OTP
                    </Text>

                    <Text className="text-dark-100/50 text-center mb-2 leading-5">
                        Code sent to {phone}
                    </Text>

                    <View className="mb-3 px-6">
                        <View className="bg-yellow-50 border border-yellow-200 rounded-xl py-2">
                            <Text className="text-center text-dark-100 font-semibold">
                                🎭 Demo Mode
                            </Text>
                            <Text className="text-center text-dark-100/70 mt-1">
                                Use <Text className="text-red-500 font-bold">123456</Text> as OTP
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row justify-center gap-1 mb-1">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                value={digit}
                                onChangeText={(text) => onOtpChange(text, index)}
                                onKeyPress={(e) => onKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={Platform.OS === 'ios' ? 1 : 6}
                                className="w-12 h-14 border-2 border-dark-100/10 rounded-lg text-center text-2xl font-medium bg-slate-100 text-dark-100"
                                selectionColor="#007AFF"
                                autoFocus={index === 0}
                                textContentType="oneTimeCode"
                                autoComplete="sms-otp"
                                importantForAutofill="yes"
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
                    <View className="items-center mb-3">
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
                        className={`w-full py-3 rounded-xl items-center ${otpLoading || !isOtpComplete
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