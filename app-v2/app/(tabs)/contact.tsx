import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { hospitalConfig } from '@/config/hospitalConfig';
import {
    ContactCard,
    HospitalAddress,
    OperatingHours,
    contactUtils
} from '@/features/contact';

const ContactScreen: React.FC = () => {
    const contactData = [
        {
            icon: (props: any) => <Ionicons name="alert-circle" {...props} />,
            title: '24/7 Emergency',
            subtitle: `${hospitalConfig.contact.emergency24x7} • ${hospitalConfig.hours.emergency}`,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergency24x7),
            bgColor: 'bg-red-500',
            iconColor: 'white',
            titleColor: 'text-white',
            isEmergency: true,
        },
        {
            icon: (props: any) => <Ionicons name="call" {...props} />,
            title: 'Emergency',
            subtitle: hospitalConfig.contact.emergencyLine,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergencyLine),
        },
        {
            icon: (props: any) => <Ionicons name="calendar" {...props} />,
            title: 'Appointments',
            subtitle: hospitalConfig.contact.appointments,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.appointments),
        },
        {
            icon: (props: any) => <Ionicons name="mail" {...props} />,
            title: 'Email',
            subtitle: hospitalConfig.email.info,
            onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.info),
        },
        {
            icon: (props: any) => <Ionicons name="chatbubble-ellipses" {...props} />,
            title: 'Support',
            subtitle: hospitalConfig.email.support,
            onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.support),
        },
    ];

    const renderEmergencyCard = () => {
        const emergencyCard = contactData.find(card => card.isEmergency);
        if (!emergencyCard) return null;

        return (
            <View className="mb-6 px-1">
                <ContactCard
                    icon={emergencyCard.icon}
                    title={emergencyCard.title}
                    subtitle={emergencyCard.subtitle}
                    onPress={emergencyCard.onPress}
                    bgColor={emergencyCard.bgColor}
                    iconColor={emergencyCard.iconColor}
                    titleColor={emergencyCard.titleColor}
                />
            </View>
        );
    };

    const renderContactGrid = () => {
        const regularCards = contactData.filter(card => !card.isEmergency);
        const pairs = [];

        for (let i = 0; i < regularCards.length; i += 2) {
            pairs.push(regularCards.slice(i, i + 2));
        }

        return (
            <View className="mb-3 px-1">
                {pairs.map((pair, index) => (
                    <View key={index} className="flex-row justify-between mb-4">
                        {pair.map((card, cardIndex) => (
                            <View key={cardIndex} className="w-[48%]">
                                <ContactCard
                                    icon={card.icon}
                                    title={card.title}
                                    subtitle={card.subtitle}
                                    onPress={card.onPress}
                                    bgColor={card.bgColor}
                                    iconColor={card.iconColor}
                                    titleColor={card.titleColor}
                                />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <View className="py-6">
                    <Text className="text-dark-100 text-3xl font-bold mb-1 text-center">
                        Contact Us
                    </Text>
                    <Text className="text-gray-500 text-base text-center">
                        We're here to help you 24/7
                    </Text>
                </View>

                {renderEmergencyCard()}

                {renderContactGrid()}

                <OperatingHours />
                <HospitalAddress />

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default ContactScreen;
