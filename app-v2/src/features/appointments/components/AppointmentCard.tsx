import { images } from '@/shared/components'
import { Appointment } from '@/shared/types'
import { parseAppointmentDateTime } from '@/shared/utils/timeUtils'
import {
  formatLocalizedNumber,
  formatLocalizedTime,
  getTranslatedField,
} from '@/shared/utils/translation'
import { getTypographyStyle } from '@/shared/utils/typography'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Text, TouchableOpacity, View } from 'react-native'

interface AppointmentCardProps {
  appointment: Appointment
  onPress?: () => void
}

type DisplayStatus = 'Upcoming' | 'Completed' | 'Cancelled'

/**
 * AppointmentCard — unified card for upcoming, completed, or cancelled appointments.
 * Tapping opens the AppointmentDetailsModal (handled by the parent).
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress }) => {
  const { t, i18n } = useTranslation()

  // DB status stays "Upcoming" until manually updated — derive display status from date/time
  const displayStatus = useMemo<DisplayStatus>(() => {
    if (appointment.status === 'Cancelled') return 'Cancelled'
    if (appointment.status === 'Completed') return 'Completed'
    const dt = parseAppointmentDateTime(appointment.date, appointment.time)
    return dt <= new Date() ? 'Completed' : 'Upcoming'
  }, [appointment.status, appointment.date, appointment.time])

  const isUpcoming = displayStatus === 'Upcoming'

  const statusConfig = {
    Upcoming: {
      color: '#2563EB',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: 'time-outline',
    },
    Cancelled: {
      color: '#DC2626',
      bg: 'bg-red-50',
      border: 'border-red-100',
      icon: 'close-circle-outline',
    },
    Completed: {
      color: '#059669',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: 'checkmark-circle-outline',
    },
  }

  const config = statusConfig[displayStatus]

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const SpecialtyIcon = ({ specialty }: { specialty: string }) => {
    const s = specialty?.toLowerCase()
    if (s === 'heart') return <Ionicons name="heart" size={12} color="#1D4ED8" />
    if (s === 'dental') return <MaterialCommunityIcons name="tooth" size={12} color="#1D4ED8" />
    if (s === 'lungs') return <MaterialCommunityIcons name="lungs" size={12} color="#1D4ED8" />

    // For kidney and liver, we use the PNG icons
    if (s === 'kidney' || s === 'liver') {
      const iconKey = s + 'Icon'
      const source = images[iconKey]
      if (!source) return <Ionicons name="medical" size={12} color="#1D4ED8" />
      return <Image source={source} style={{ width: 12, height: 12 }} tintColor="#1D4ED8" />
    }

    return <Ionicons name="medical" size={12} color="#1D4ED8" />
  }

  return (
    <View
      className="mx-5 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 4,
        backgroundColor: 'transparent',
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm"
      >
        <View className="p-6">
          {/* Header: Specialty & Status */}
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5">
              <SpecialtyIcon specialty={appointment.specialty} />
              <Text
                className="uppercase tracking-wide text-blue-600"
                style={[{ color: '#2563EB' }, getTypographyStyle('black', 10)]}
              >
                {getTranslatedField(appointment, 'specialty', i18n.language)}
              </Text>
            </View>
            <View
              className={`${config.bg} rounded-xl border px-3 py-1.5 ${config.border} flex-row items-center gap-1.5`}
            >
              <Ionicons name={config.icon as any} size={12} color={config.color} />
              <Text
                className="uppercase tracking-wide"
                style={[{ color: config.color }, getTypographyStyle('black', 10)]}
              >
                {t(`appointments.card.status.${displayStatus.toLowerCase()}`)}
              </Text>
            </View>
          </View>

          {/* Main Body: Doctor Info */}
          <View className="mb-3">
            <Text
              className="mb-1 leading-tight text-gray-900"
              numberOfLines={1}
              style={getTypographyStyle('black', 20)}
            >
              {getTranslatedField(appointment, 'doctor_name', i18n.language)}
            </Text>
          </View>

          {/* Info Block: Date and Time in a high-contrast container */}
          <View className="mb-5 flex-row items-center rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white">
                <Ionicons name="calendar" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text className="uppercase text-gray-400" style={getTypographyStyle('bold', 8)}>
                  {t('appointments.details.date')}
                </Text>
                <Text className="text-gray-900" style={getTypographyStyle('black', 13)}>
                  {formatDate(appointment.date)}
                </Text>
              </View>
            </View>
            <View className="mx-4 h-8 w-[1px] bg-gray-200" />
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-white">
                <Ionicons name="time" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text className="uppercase text-gray-400" style={getTypographyStyle('bold', 8)}>
                  {t('appointments.details.time')}
                </Text>
                <Text className="text-gray-900" style={getTypographyStyle('black', 13)}>
                  {formatLocalizedTime(appointment.time, i18n.language)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer: Patient & Amount */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100">
                <Ionicons name="person" size={18} color="#4B5563" />
              </View>
              <View>
                <Text className="text-gray-900" style={getTypographyStyle('medium', 12)}>
                  {t('appointments.details.patient')}
                </Text>
                <Text className="text-gray-900" style={getTypographyStyle('black', 15)}>
                  {getTranslatedField(appointment, 'patient_name' as any, i18n.language) ||
                    appointment.patient_name}
                </Text>
              </View>
            </View>
            <View className="rounded-2xl bg-gray-100 px-4 py-2.5">
              <Text className="text-gray-900" style={getTypographyStyle('black', 15)}>
                ৳ {formatLocalizedNumber(appointment.amount, i18n.language)}
              </Text>
            </View>
          </View>

          {/* Hint for tap */}
          {isUpcoming && (
            <View className="mt-5 flex-row items-center justify-center border-t border-gray-50 pt-4">
              <Text
                className="uppercase tracking-widest text-gray-400"
                style={getTypographyStyle('bold', 9)}
              >
                {t('appointments.card.tapHint')}
              </Text>
              <Ionicons name="chevron-forward" size={12} color="#D1D5DB" className="ml-1" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}
