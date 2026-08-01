import { hospitalConfig } from '@/config/hospitalConfig'
import { ContactCard, HospitalAddress, OperatingHours, contactUtils } from '@/features/contact'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const ContactScreen: React.FC = () => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 12) + 110

  const emergency = {
    icon: (props: any) => <Ionicons name="medkit" {...props} />,
    title: t('contact.emergency247'),
    subtitle: `${hospitalConfig.contact.emergency24x7} • ${hospitalConfig.hours.emergency}`,
    onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergency24x7),
  }

  const directory = [
    {
      icon: (props: any) => <Ionicons name="call-outline" {...props} />,
      title: t('contact.emergency'),
      subtitle: hospitalConfig.contact.emergencyLine,
      onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergencyLine),
    },
    {
      icon: (props: any) => <Ionicons name="calendar-outline" {...props} />,
      title: t('contact.appointments'),
      subtitle: hospitalConfig.contact.appointments,
      onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.appointments),
    },
    {
      icon: (props: any) => <Ionicons name="mail-outline" {...props} />,
      title: t('contact.email'),
      subtitle: hospitalConfig.email.info,
      onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.info),
    },
    {
      icon: (props: any) => <Ionicons name="headset-outline" {...props} />,
      title: t('contact.support'),
      subtitle: hospitalConfig.email.support,
      onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.support),
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 8 }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: 'Quicksand-Bold',
              color: '#0F172A',
              letterSpacing: -0.6,
            }}
          >
            {t('contact.title')}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Quicksand-Medium',
              color: '#64748B',
              paddingLeft: 4,
              lineHeight: 22,
            }}
          >
            {t('contact.subtitle')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 10 }}>
          <View style={{ marginBottom: 8 }}>
            <ContactCard
              icon={emergency.icon}
              title={emergency.title}
              subtitle={emergency.subtitle}
              onPress={emergency.onPress}
              isEmergency
            />
          </View>

          <View style={{ marginBottom: 8 }}>
            {directory.map((item, index) => (
              <ContactCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={item.onPress}
                isLast={index === directory.length - 1}
              />
            ))}
          </View>

          <OperatingHours />
          <HospitalAddress />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ContactScreen
