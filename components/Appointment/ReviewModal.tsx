import React, { useEffect, useRef, useState } from 'react'
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Star } from 'lucide-react-native'
import { toast } from 'sonner-native'
import { Appointment } from '@/types'
import { getUserReview, insertReview } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'

interface ReviewModalProps {
    appointment: Appointment
    visible: boolean
    onClose: () => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    appointment,
    visible,
    onClose
}) => {
    const { user, dbUser } = useAuthStore()
    const [rating, setRating] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const translateX = useRef(new Animated.Value(Dimensions.get('window').width)).current

    useEffect(() => {
        if (visible) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(translateX, {
                toValue: Dimensions.get('window').width,
                duration: 250,
                useNativeDriver: true,
            }).start()
        }
    }, [visible])

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        if (!reviewText.trim()) {
            toast.error('Please write a review')
            return
        }

        setIsSubmitting(true)
        try {
            const userReviewExit = await getUserReview({
                appointmentId: appointment?.$id!,
                userId: user?.id || dbUser?.$id,
            })

            if (userReviewExit) {
                toast.error('You have already written a review for this patient')
                onClose()
                setRating(0)
                setReviewText('')
                return
            }

            await insertReview({
                //@ts-ignore
                appointmentId: appointment?.$id,
                //@ts-ignore
                doctorId: appointment.doctorId?.$id,
                patientName: appointment.patient_name || user?.name,
                rating,
                review: reviewText,
                userId: user?.id || dbUser?.$id
            })

            toast.success('Review submitted successfully!')
            onClose()
            setRating(0)
            setReviewText('')
        } catch (error: any) {
            console.error('Error submitting review:', error)
            toast.error('Failed to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const StarRating = () => (
        <View className="flex-row justify-start mb-2 pl-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    className="mx-1"
                    activeOpacity={0.7}
                >
                    <Star
                        size={32}
                        color={star <= rating ? "#fbbf24" : "#d1d5db"}
                        fill={star <= rating ? "#fbbf24" : "transparent"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    )

    if (!visible) return null

    return (
        <Modal transparent visible={visible} animationType="none">
            <Animated.View
                style={{ transform: [{ translateX }] }}
                className="absolute inset-0"
            >
                <SafeAreaView className="flex-1 bg-gray-50 pb-6">
                    <View className="flex-row justify-center items-center relative">
                        <TouchableOpacity
                            onPress={onClose}
                            disabled={isSubmitting}
                            className="p-2 absolute top-0 left-0"
                        >
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-900 mt-1">Write Review</Text>
                    </View>

                    <ScrollView className="flex-1 px-10 py-6">
                        <DoctorInfo appointment={appointment} />
                        <PatientNameInput
                            value={user?.name || appointment.patient_name}
                        />
                        <RatingSection
                            rating={rating}
                            StarRating={StarRating}
                        />
                        <ReviewTextSection
                            reviewText={reviewText}
                            setReviewText={setReviewText}
                        />
                    </ScrollView>

                    <SubmitButton
                        onPress={handleSubmitReview}
                        isSubmitting={isSubmitting}
                        disabled={isSubmitting || rating === 0 || !reviewText.trim()}
                    />
                </SafeAreaView>
            </Animated.View>
        </Modal>
    )
}












const DoctorInfo: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <View className="items-center mb-8">
        <Image
            //@ts-ignore
            source={{ uri: appointment.doctorId.image }}
            className="w-20 h-20 rounded-full mb-3"
        />
        <Text className="text-xl font-semibold text-gray-900">
            {appointment.doctor_name}
        </Text>
        <Text className="text-gray-600">{appointment.specialty}</Text>
    </View>
)

const PatientNameInput: React.FC<{ value: string }> = ({ value }) => (
    <View className="mb-6">
        <Text className="px-1 pl-4 font-medium text-dark-100/70 mb-2">Patient Name</Text>
        <TextInput
            value={value}
            editable={false}
            className="bg-white px-4 py-3 rounded-xl text-dark-100/50 font-medium"
        />
    </View>
)

const RatingSection: React.FC<{
    rating: number
    StarRating: React.ComponentType
}> = ({ rating, StarRating }) => (
    <View className="mb-6">
        <Text className="pl-4 font-medium text-dark-100/70 mb-4">
            How was your experience?
        </Text>
        <StarRating />
        {rating > 0 && (
            <Text className="pl-4 font-medium text-dark-100/70 mb-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
            </Text>
        )}
    </View>
)

const ReviewTextSection: React.FC<{
    reviewText: string
    setReviewText: (text: string) => void
}> = ({ reviewText, setReviewText }) => (
    <View className="mb-8 mx-4">
        <Text className="font-medium text-dark-100/70 mb-4">Your Review</Text>
        <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Share your experience with this doctor..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="border border-gray-200 rounded-xl p-4 text-gray-700"
            style={{ height: 120 }}
            maxLength={500}
        />
        <Text className="text-xs text-gray-500 mt-1 text-right pr-2">
            {reviewText.length}/500
        </Text>
    </View>
)

const SubmitButton: React.FC<{
    onPress: () => void
    isSubmitting: boolean
    disabled: boolean
}> = ({ onPress, isSubmitting, disabled }) => (
    <View className="px-4 py-10">
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`py-4 rounded-xl items-center ${disabled ? 'bg-gray-300' : 'bg-blue-500'
                }`}
        >
            <Text className={`font-semibold ${disabled ? 'text-gray-500' : 'text-white'
                }`}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Text>
        </TouchableOpacity>
    </View>
)