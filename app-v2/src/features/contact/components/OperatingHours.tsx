import { hospitalConfig } from '@/config/hospitalConfig'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

export const OperatingHours: React.FC = () => {
  const { t } = useTranslation()

  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={{
          fontSize: 11,
          fontFamily: 'Quicksand-Bold',
          color: '#94A3B8',
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {t('contact.operatingHoursTitle')}
      </Text>

      <View
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 4,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: 'Quicksand-SemiBold',
              color: '#64748B',
              paddingRight: 12,
            }}
          >
            {t('contact.emergency247Title')}
          </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: 'Quicksand-Bold',
              color: '#DC2626',
              textAlign: 'right',
            }}
          >
            {hospitalConfig.hours.emergency}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 14,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: 'Quicksand-SemiBold',
              color: '#64748B',
              paddingRight: 12,
            }}
          >
            {t('contact.opdTitle')}
          </Text>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: 'Quicksand-Bold',
              color: '#0F172A',
              textAlign: 'right',
            }}
          >
            {hospitalConfig.hours.opd}
          </Text>
        </View>
      </View>
    </View>
  )
}
