import { useAppointmentUtils } from '@/hooks/useAppointmentUtils'
import { cancelAppointment, createAppointmentCancelledNotification, getDoctor } from '@/lib/appwrite'
import useAppwrite from '@/lib/useAppwrite'
import useAuthStore from '@/store/auth.store'
import useNotificationStore from '@/store/notification.store'
import { Appointment } from '@/types'
import { Calendar, Clock, Phone, User, X, XCircle } from 'lucide-react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { toast } from 'sonner-native'

interface AppointmentDetailsModalProps {
    appointment: Appointment
    visible: boolean
    onClose: () => void
    onReschedule: () => void
    isUpcoming: boolean
    onWriteReview: () => void
    onRefresh: () => void
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
    appointment,
    visible,
    onClose,
    onReschedule,
    isUpcoming,
    onWriteReview,
    onRefresh
}) => {
    const { user } = useAuthStore()
    const { fetchUnreadCount, fetchNotifications } = useNotificationStore()
    const { formatDate, formatTime } = useAppointmentUtils()

    const [showModal, setShowModal] = useState(visible)
    const [isLoading, setIsLoading] = useState(false)
    const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current
    const opacity = useRef(new Animated.Value(0)).current

    const doctorId = useMemo(() => {
        //@ts-ignore
        return appointment?.doctorId?.$id || null
        //@ts-ignore
    }, [appointment?.doctorId?.$id])

    const { data: modalDoctor } = useAppwrite({
        fn: getDoctor,
        params: { id: doctorId! },
        skip: !doctorId,
    })

    const isCancelled = appointment.status === 'Cancelled'

    useEffect(() => {
        if (visible) {
            setShowModal(true)
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: Dimensions.get('window').height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => setShowModal(false))
        }
    }, [visible])

    const handleCancel = async () => {
        if (isLoading || !user?.phone) return

        setIsLoading(true)
        try {
            const result = await cancelAppointment(appointment, appointment.$id!)

            if (result.status === 200) {
                onRefresh()
                toast.success('Appointment cancelled successfully!')

                if (user.id) {
                    await createAppointmentCancelledNotification(
                        appointment,
                        appointment.$id!,
                        user.id
                    )
                    await fetchUnreadCount(user.id)
                    await fetchNotifications(user.id)
                }
            } else if (result.status === 404) {
                toast.error('Appointment not found!')
            } else {
                toast.error('An unexpected error occurred while cancelling the appointment. Please try again.')
            }
        } catch (error: any) {
            console.error('Cancel appointment error:', error)
            toast.error('An unexpected error occurred while cancelling the appointment. Please try again.')
        } finally {
            setIsLoading(false)
            setShowModal(false)
            onClose()
        }
    }

    if (!showModal) return null

    return (
        <Modal transparent visible={showModal} animationType="none">
            <Animated.View style={{ opacity }} className="absolute inset-0 bg-black/50">
                <Pressable className="flex-1" onPress={onClose} />
            </Animated.View>

            <Animated.View
                style={{ transform: [{ translateY }] }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 max-h-[94%]"
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                    <View className="self-center w-10 h-1 bg-gray-300 rounded-full mb-4" />
                    <View className="w-full flex items-end mb-2">
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-gray-50 justify-center items-center p-1"
                            onPress={onClose}
                        >
                            <X color="rgba(0,0,0,1)" size={24} />
                        </TouchableOpacity>
                    </View>
                    {isCancelled && <CancelledBadge />}

                    <DoctorHeader appointment={appointment} />
                    <AppointmentDetails appointment={appointment} formatDate={formatDate} formatTime={formatTime} />
                    <DoctorSpecialties appointment={appointment} />
                    <DoctorBio appointment={appointment} />

                    <ActionButtons
                        isCancelled={isCancelled}
                        isUpcoming={isUpcoming}
                        isLoading={isLoading}
                        onCancel={handleCancel}
                        onReschedule={onReschedule}
                        onWriteReview={onWriteReview}
                    />
                </ScrollView>
            </Animated.View>
        </Modal>
    )
}









const CancelledBadge = () => (
    <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
        <View className="flex-row items-center">
            <XCircle size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold ml-2">
                This appointment has been cancelled
            </Text>
        </View>
    </View>
)

const DoctorHeader: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <View className="items-center py-4">
        <Image
            //@ts-ignore
            source={{ uri: appointment.doctorId.image }}
            className="w-24 h-24 rounded-full mb-3"
        />
        <Text className="text-2xl font-semibold text-gray-900 text-center">
            {appointment.doctor_name}
        </Text>
        <Text className="text-base text-gray-600 mt-1">{appointment.specialty}</Text>
    </View>
)

const AppointmentDetails: React.FC<{
    appointment: Appointment
    formatDate: (date: string) => string
    formatTime: (time: string) => string
}> = ({ appointment, formatDate, formatTime }) => (
    <View className="mb-6 bg-gray-50 rounded-xl p-4">
        <View className="flex-row gap-4 mb-4">
            <DetailCard
                icon={<Clock size={14} color="#9CA3AF" />}
                label="Time"
                value={formatTime(appointment.time)}
            />
            <DetailCard
                icon={<Calendar size={14} color="#9CA3AF" />}
                label="Date"
                value={`${formatDate(appointment.date)} `}
            />
        </View>

        <View className="flex-row gap-4 mb-4">
            <DetailCard
                icon={<User size={14} color="#9CA3AF" />}
                label="Patient"
                value={`${appointment.patient_name}, ${appointment.patient_age}`}
            />
            <DetailCard
                icon={<Phone size={14} color="#9CA3AF" />}
                label="Contact"
                value={appointment.contactNumber}
            />
        </View>

        <ConsultationFeeCard appointment={appointment} />
    </View>
)

const DetailCard: React.FC<{
    icon: React.ReactNode
    label: string
    value: string
}> = ({ icon, label, value }) => (
    <View className="flex-1">
        <View className="bg-white p-3 rounded-lg">
            <View className="flex-row items-center gap-1 mb-1">
                {icon}
                <Text className="text-sm text-gray-400 font-medium">{label}</Text>
            </View>
            <Text className="text-gray-600 font-medium text-sm">{value}</Text>
        </View>
    </View>
);

const ConsultationFeeCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
    const isCancelled = appointment.status === 'Cancelled'

    return (
        <View className="bg-white p-3 rounded-lg">
            <Text className="text-xs text-gray-400 mb-1">Consultation Fee</Text>
            <View className="flex-row items-center justify-between">
                <Text className="text-gray-800 font-medium">৳{appointment.amount}</Text>
                <Text className={`text-xs px-2 py-1 rounded-full ${isCancelled ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                    }`}>
                    {isCancelled ? 'Refunded' : 'Paid'}
                </Text>
            </View>
        </View>
    )
}

const DoctorSpecialties: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <View className="mb-6 px-2">
        <Text className="text-sm font-medium text-gray-900 mb-3">Specializations</Text>
        <View className="flex-row flex-wrap">
            {appointment.doctorId
                //@ts-ignore
                .specialties.map((specialty: any, index: any) => (
                    <View key={index} className="bg-blue-50 px-3 py-1.5 rounded-full mr-2 mb-2">
                        <Text className="text-blue text-xs">{specialty.split(' - ')[0]}</Text>
                    </View>
                ))}
        </View>
    </View>
)

const DoctorBio: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <View className="mb-6 px-2">
        <Text className="font-medium text-gray-900 mb-2">About Doctor</Text>
        <Text className="text-gray-600">
            {appointment.doctorId
                //@ts-ignore
                .experience}
        </Text>
    </View>
)

const ActionButtons: React.FC<{
    isCancelled: boolean
    isUpcoming: boolean
    isLoading: boolean
    onCancel: () => void
    onReschedule: () => void
    onWriteReview: () => void
}> = ({ isCancelled, isUpcoming, isLoading, onCancel, onReschedule, onWriteReview }) => {
    if (isCancelled) {
        return (
            <TouchableOpacity
                className="flex-1 py-3 bg-blue-50 border border-blue-200 rounded-xl items-center px-2"
                onPress={onReschedule}
                disabled={isLoading}
            >
                <Text className="text-blue font-medium">Book New Appointment</Text>
            </TouchableOpacity>
        )
    }

    if (isUpcoming) {
        return (
            <View className="flex-row gap-3 px-2">
                <TouchableOpacity
                    className="flex-1 py-3 border border-red-100 bg-red-50 rounded-xl items-center"
                    onPress={onCancel}
                    disabled={isLoading}
                >
                    <Text className="text-red-500 font-medium">
                        {isLoading ? 'Cancelling...' : 'Cancel'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 py-3 bg-blue-50 border border-blue-200 rounded-xl items-center"
                    onPress={onReschedule}
                    disabled={isLoading}
                >
                    <Text className="text-blue font-medium">Reschedule</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <TouchableOpacity
            className="flex-1 py-3 bg-blue-50 border border-blue-200 rounded-xl items-center px-2"
            onPress={onWriteReview}
        >
            <Text className="text-blue font-medium">Write a Review</Text>
        </TouchableOpacity>
    )
}  