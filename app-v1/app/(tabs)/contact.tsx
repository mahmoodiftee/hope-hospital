import { ContactCard } from '@/components/Contact/ContactCard';
import { HospitalAddress } from '@/components/Contact/HospitalAddress';
import { OperatingHours } from '@/components/Contact/OperatingHours';
import { hospitalConfig } from '@/config/hospitalConfig';
import { contactUtils } from '@/utils/contactUtils';
import {
    Calendar,
    Mail,
    MessageCircle,
    PhoneCall,
    Siren,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const Contact: React.FC = () => {
    const contactData = [
        {
            icon: Siren,
            title: '24/7 Emergency',
            subtitle: `${hospitalConfig.contact.emergency24x7} • ${hospitalConfig.hours.emergency}`,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergency24x7),
            bgColor: 'bg-red-500',
            iconColor: hospitalConfig.ui.colors.white,
            titleColor: 'text-white',
            isEmergency: true,
        },
        {
            icon: PhoneCall,
            title: 'Emergency',
            subtitle: hospitalConfig.contact.emergencyLine,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.emergencyLine),
        },
        {
            icon: Calendar,
            title: 'Appointments',
            subtitle: hospitalConfig.contact.appointments,
            onPress: () => contactUtils.handlePhoneCall(hospitalConfig.contact.appointments),
        },
        {
            icon: Mail,
            title: 'Email',
            subtitle: hospitalConfig.email.info,
            onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.info),
        },
        {
            icon: MessageCircle,
            title: 'Support',
            subtitle: hospitalConfig.email.support,
            onPress: () => contactUtils.handleEmailPress(hospitalConfig.email.support),
        },
    ];

    const renderEmergencyCard = () => {
        const emergencyCard = contactData.find(card => card.isEmergency);
        if (!emergencyCard) return null;

        return (
            <View className="mb-6">
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
            <View className="mb-3">
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
                <View className="py-4">
                    <Text className="text-dark-100 text-3xl font-bold mb-1 text-center">
                        Contact Us
                    </Text>
                    <Text className="text-gray-500 text-base text-center">
                        We&apos;re here to help you 24/7
                    </Text>
                </View>

                {renderEmergencyCard()}

                {renderContactGrid()}

                <OperatingHours />
                {/* <MapSection /> */}
                <HospitalAddress />

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Contact;