import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, ImageBackground, Linking, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Heart, Phone, Siren, Stethoscope } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { useTranslation, Trans } from 'react-i18next';
import { images } from './mockData';

type ServiceType = {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<any>;
    bgGradient: string[];
    accentColor: string;
    time?: string;
    status: string;
    statusColor: string;
};

type HospitalServicesProps = {
    setSearchModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const { width: screenWidth } = Dimensions.get('window');

const PatternBackground = ({ source }: { source: any }) => (
    <ImageBackground
        source={source}
        resizeMode="cover"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}
    />
);

const ServiceCard = ({
    service,
    onBookPress,
    onCallPress
}: {
    service: ServiceType;
    onBookPress: () => void;
    onCallPress: () => void
}) => {
    const Icon = service.icon;
    const patternSource =
        service.id === 1 ? images.ambulance :
            service.id === 2 ? images.opd :
                images.texture;

    return (
        <View style={{ width: screenWidth }}>
            <LinearGradient
                //@ts-ignore
                colors={service.bgGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 20, overflow: 'hidden', marginHorizontal: 16 }}
            >
                <PatternBackground source={patternSource} />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                        {/* <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                            {service.status}
                        </Text> */}
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, marginTop: 4 }}>
                            {service.title}
                        </Text>
                        <Text style={{ color: 'white', fontSize: 14, marginTop: 4 }}>
                            {service.subtitle}
                        </Text>
                    </View>

                    <View style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon color="white" size={28} />
                    </View>
                </View>

                <Text style={{ color: 'white', fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
                    {service.description}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View style={{ flex: 1 }}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.25)']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ padding: 12, borderRadius: 25 }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Clock color="white" size={18} />
                                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                                    {service.time}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, gap: 8 }}>
                        {(service.id === 2 || service.id === 3) && (
                            <TouchableOpacity
                                onPress={onBookPress}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Calendar color="white" size={20} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onCallPress}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Phone color="white" size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const DotIndicator = ({
    count,
    activeIndex,
    onPress
}: {
    count: number;
    activeIndex: number;
    onPress: (index: number) => void
}) => {
    const dotColors = ['#B91C1C', '#047857', '#6D28D9'];

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 8 }}>
            {Array.from({ length: count }).map((_, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => onPress(index)}
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: index === activeIndex ? dotColors[index] : '#D1D5DB',
                    }}
                />
            ))}
        </View>
    );
};

export const HospitalServices: React.FC<HospitalServicesProps> = ({ setSearchModalVisible }) => {
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const hospitalServices: ServiceType[] = [
        {
            id: 1,
            title: t("emergency"),
            subtitle: t("emergencySub"),
            description: t("emergencyDesc"),
            icon: Siren,
            bgGradient: ['#DC2626', '#B91C1C'],
            accentColor: "#FEE2E2",
            time: t("available24_7"),
            status: t("activeNow"),
            statusColor: "#10B981"
        },
        {
            id: 2,
            title: t("opd"),
            subtitle: t("opdSub"),
            description: t("opdDesc"),
            icon: Stethoscope,
            bgGradient: ['#059669', '#047857'],
            accentColor: "#D1FAE5",
            time: t("opdTime"),
            status: t("openToday"),
            statusColor: "#059669"
        },
        {
            id: 3,
            title: t("specializedCare"),
            subtitle: t("specializedCareSub"),
            description: t("specializedCareDesc"),
            icon: Heart,
            bgGradient: ['#7C3AED', '#6D28D9'],
            accentColor: "#EDE9FE",
            time: t("byAppointment"),
            status: t("bookNow"),
            statusColor: "#F59E0B"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const nextIndex = (prev + 1) % hospitalServices.length;
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                return nextIndex;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleDotPress = (index: number) => {
        setCurrentIndex(index);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const handlePhoneCall = () => {
        const url = 'tel:+8801818928493';
        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) Linking.openURL(url);
                else toast.error('Phone calls are not supported on this device');
            })
            .catch(err => console.error('Error opening phone dialer:', err));
    };

    return (
        <View className="mb-6">
            <FlatList
                ref={flatListRef}
                data={hospitalServices}
                renderItem={({ item }) => (
                    <ServiceCard
                        service={item}
                        onBookPress={() => setSearchModalVisible(true)}
                        onCallPress={handlePhoneCall}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={screenWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentIndex(index);
                }}
                getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
            />

            <DotIndicator
                count={hospitalServices.length}
                activeIndex={currentIndex}
                onPress={handleDotPress}
            />
        </View>
    );
};
