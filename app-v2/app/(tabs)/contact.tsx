import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hospitalConfig } from '@/config/hospitalConfig';
import {
    ContactCard,
    HospitalAddress,
    OperatingHours,
    contactUtils,
} from '@/features/contact';

const ContactScreen: React.FC = () => {
    const { t } = useTranslation();

    const emergency = {
        icon: (props: any) => <Ionicons name="medkit" {...props} />,
        title: t('contact.emergency247'),
        subtitle: `${hospitalConfig.contact.emergency24x7} • ${hospitalConfig.hours.emergency}`,
        onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergency24x7),
    };

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
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Clinical masthead */}
                <View
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: 28,
                        paddingBottom: 28,
                        borderBottomWidth: 1,
                        borderBottomColor: '#EEF2F7',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                        <View
                            style={{
                                width: 3,
                                backgroundColor: '#2563EB',
                                borderRadius: 2,
                                marginRight: 14,
                            }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 30,
                                    fontFamily: 'Quicksand-Bold',
                                    color: '#0F172A',
                                    letterSpacing: -0.6,
                                    marginBottom: 8,
                                }}
                            >
                                {t('contact.title')}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontFamily: 'Quicksand-Medium',
                                    color: '#64748B',
                                    lineHeight: 22,
                                }}
                            >
                                {t('contact.subtitle')}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
                    {/* Emergency call strip */}
                    <View style={{ marginBottom: 32 }}>
                        <ContactCard
                            icon={emergency.icon}
                            title={emergency.title}
                            subtitle={emergency.subtitle}
                            onPress={emergency.onPress}
                            isEmergency
                        />
                    </View>

                    {/* Phone / email directory (list, not grid) */}
                    <View style={{ marginBottom: 28 }}>
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
    );
};

export default ContactScreen;
