import { useAppointmentStatus } from '@/hooks/useAppointmentStatus'
import { useAppointmentUtils } from '@/hooks/useAppointmentUtils'
import { Appointment } from '@/types'
import { AlertCircle, BadgeCheck, ChevronRight, User } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { AppointmentBookingModal } from './AppointmentBookingModal'
import { ReviewModal } from './ReviewModal'
import { AppointmentDetailsModal } from './AppointmentDetailsModal'

interface AppointmentCardProps {
  appointment: Appointment
  onRefresh: () => void
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onRefresh
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [bookingModalVisible, setBookingModalVisible] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)

  const { formatDate, formatTime, getAppointmentDate } = useAppointmentUtils()
  const { getAppointmentStatus } = useAppointmentStatus()

  const isUpcoming = useMemo(() => {
    if (appointment.status === 'Cancelled') return false
    return getAppointmentDate(appointment.date, appointment.time) > new Date()
  }, [appointment.date, appointment.time, appointment.status, getAppointmentDate])

  const appointmentStatus = useMemo(() =>
    getAppointmentStatus(appointment),
    [appointment, getAppointmentStatus]
  )

  const getButtonConfig = () => {
    if (appointment.status === 'Cancelled') {
      return { text: 'Book New', color: '#10b981', bgColor: '#22c55e' }
    }
    if (!isUpcoming) {
      return { text: 'Write a Review', color: '#22c55e', bgColor: '#22c55e' }
    }
    return { text: 'View Details', color: '#007AFF', bgColor: '#007AFF' }
  }

  const buttonConfig = getButtonConfig()

  const handleReschedule = () => {
    setModalVisible(false)
    setBookingModalVisible(true)
  }

  const handleWriteReview = () => {
    setModalVisible(false)
    setReviewModalVisible(true)
  }

  const handleModalClose = () => {
    setBookingModalVisible(false)
    setTimeout(onRefresh, 500)
  }

  return (
    <>
      <View className="bg-white rounded-2xl py-4 my-4 shadow-lg mx-4">
        {/* Status Header */}
        <AppointmentStatusHeader
          appointmentStatus={appointmentStatus}
          date={appointment.date}
          time={appointment.time}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        {/* Consultation Info */}
        <ConsultationInfo
          specialty={appointment.specialty}
          doctorName={appointment.doctor_name}
        />

        {/* Doctor Card */}
        <DoctorCard
          appointment={appointment}
        />

        {/* Patient Card */}
        <PatientCard
          patientName={appointment.patient_name}
          patientAge={appointment.patient_age}
        />

        {/* Action Button */}
        <ActionButton
          config={buttonConfig}
          onPress={() => setModalVisible(true)}
        />
      </View>

      <AppointmentDetailsModal
        appointment={appointment}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onReschedule={handleReschedule}
        onWriteReview={handleWriteReview}
        isUpcoming={isUpcoming}
        onRefresh={onRefresh}
      />

      <ReviewModal
        appointment={appointment}
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
      />

      <AppointmentBookingModal
        appointment={appointment}
        visible={bookingModalVisible}
        onClose={handleModalClose}
      />
    </>
  )
}

// Sub-components for AppointmentCard
const AppointmentStatusHeader: React.FC<{
  appointmentStatus: {
    IconComponent: typeof AlertCircle;
    iconProps: { size: number; color: string };
    text: string;
    color: string;
  };
  date: string;
  time: string;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
}> = ({ appointmentStatus, date, time, formatDate, formatTime }) => (
  <View className="px-4 mb-2">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <appointmentStatus.IconComponent {...appointmentStatus.iconProps} />
        <Text
          style={{
            marginLeft: 8,
            fontWeight: '600',
            color: appointmentStatus.color,
          }}
        >
          {appointmentStatus.text}
        </Text>
      </View>
      <Text className="text-sm text-gray-600">
        {formatDate(date)} • {formatTime(time)}
      </Text>
    </View>
  </View>
)

const ConsultationInfo: React.FC<{
  specialty: string
  doctorName: string
}> = ({ specialty, doctorName }) => (
  <View className="mb-2 px-4">
    <Text className="text-sm font-semibold text-dark-100">
      {specialty} Consultation
    </Text>
    <Text className="text-sm text-gray-600">
      Your appointment with {doctorName}
    </Text>
  </View>
)

const DoctorCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
  <View className="flex-row items-center mb-2 mx-2 rounded-lg p-2 bg-slate-50/90">
    <Image
      //@ts-ignore
      source={{ uri: appointment.doctorId.image }}
      className="w-12 h-12 rounded-xl mr-4"
      resizeMode="cover"
    />
    <View className="flex-1">
      <Text className="font-medium text-dark-100">
        Dr. {appointment.doctor_name.replace('Dr. ', '')}
      </Text>
      <Text className="text-sm text-gray-500">
        {appointment.specialty}
      </Text>
    </View>
    <View className="items-end">
      <Text className="text-lg font-bold text-dark-100">
        ৳{appointment.amount}
      </Text>
      <Text className="text-xs text-gray-500">
        Consultation fee
      </Text>
    </View>
  </View>
)

const PatientCard: React.FC<{
  patientName: string
  patientAge: string | number
}> = ({ patientName, patientAge }) => (
  <View className="rounded-lg p-2 mx-2 bg-slate-50/90 mb-4">
    <Text className="text-sm font-medium text-dark-100 mb-2">
      Patient Information
    </Text>
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
          <User size={14} color="#3b82f6" />
        </View>
        <View>
          <Text className="font-medium text-dark-100">
            {patientName}
          </Text>
          <Text className="text-sm text-gray-500">
            Age: {patientAge} years
          </Text>
        </View>
      </View>
      <BadgeCheck color="#43B75D" size={25} />
    </View>
  </View>
)

const ActionButton: React.FC<{
  config: { text: string; bgColor: string }
  onPress: () => void
}> = ({ config, onPress }) => (
  <View className="flex-row gap-3 px-2">
    <TouchableOpacity
      style={{ backgroundColor: config.bgColor }}
      className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text className="text-white font-medium mr-1">
        {config.text}
      </Text>
      <ChevronRight size={16} color="white" />
    </TouchableOpacity>
  </View>
)