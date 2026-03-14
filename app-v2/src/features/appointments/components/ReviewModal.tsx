import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppTextInput } from '@/shared/components/AppTextInput';
import { Star, X } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { Appointment } from '@/shared/types';
import { AppointmentService } from '../services/appointment.service';
import { useAuth } from '@/features/auth';

interface ReviewModalProps {
    appointment: Appointment;
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    appointment,
    visible,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const { user, dbUser } = useAuth();
    const userId = user?.id || dbUser?.$id || '';

    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t('appointments.review.errors.selectRating'));
            return;
        }
        if (!reviewText.trim()) {
            toast.error(t('appointments.review.errors.writeReview'));
            return;
        }
        if (!appointment.$id || !userId) {
            toast.error(t('appointments.review.errors.missingInfo'));
            return;
        }

        setIsSubmitting(true);
        try {
            // Check for duplicate review
            const alreadyReviewed = await AppointmentService.checkReviewExists(
                appointment.$id,
                userId
            );
            if (alreadyReviewed) {
                toast.error(t('appointments.review.errors.alreadyReviewed'));
                onClose();
                return;
            }

            await AppointmentService.insertReview({
                appointmentId: appointment.$id,
                doctorId: typeof appointment.doctorId === 'string'
                    ? appointment.doctorId
                    : (appointment.doctorId as any)?.$id || '',
                patientName: appointment.patient_name,
                rating,
                review: reviewText.trim(),
                userId,
            });

            toast.success(t('appointments.review.success'));
            onSuccess?.();
            onClose();

            // Reset form
            setRating(0);
            setReviewText('');
        } catch (error: any) {
            toast.error(error.message || t('appointments.review.errors.submitFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center"
            >
                <Pressable className="flex-1 bg-black/50 justify-center p-6" onPress={Keyboard.dismiss}>
                    <Pressable className="bg-white rounded-3xl p-6" onPress={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {t('appointments.review.title')}
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 justify-center items-center"
                            >
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Doctor Info */}
                        <View className="bg-blue-50 p-3 rounded-xl mb-6">
                            <Text className="text-gray-900 font-bold">
                                {appointment.doctor_name}
                            </Text>
                            <Text className="text-gray-500 font-medium text-sm">
                                {appointment.specialty}
                            </Text>
                        </View>

                        {/* Star Rating */}
                        <Text className="text-sm font-bold text-gray-700 mb-3">
                            {t('appointments.review.rateExperience')}
                        </Text>
                        <View className="flex-row justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setRating(star)}
                                    activeOpacity={0.7}
                                >
                                    <Star
                                        size={36}
                                        color={star <= rating ? '#f59e0b' : '#d1d5db'}
                                        fill={star <= rating ? '#f59e0b' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Review Text */}
                        <Text className="text-sm font-bold text-gray-700 mb-2">
                            {t('appointments.review.yourReview')}
                        </Text>
                        <AppTextInput
                            containerStyle={{ minHeight: 120, height: 'auto', textAlignVertical: 'top', paddingVertical: 12, borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12 }}
                            placeholder={t('appointments.review.placeholder')}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={reviewText}
                            onChangeText={setReviewText}
                            maxLength={500}
                        />
                        <Text className="text-xs text-gray-400 font-medium text-right -mt-5 mb-6">
                            {reviewText.length}/500
                        </Text>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full h-14 rounded-2xl items-center justify-center ${isSubmitting ? 'bg-gray-100' : 'bg-blue-500'
                                }`}
                            activeOpacity={0.8}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#3B82F6" />
                            ) : (
                                <Text className="text-white font-bold text-lg">
                                    {t('appointments.review.submit')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};
