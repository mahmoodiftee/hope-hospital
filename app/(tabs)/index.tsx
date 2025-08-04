import DoctorSearchModal from "@/components/DoctorSearchModal";
import HospitalGallery from "@/components/HospitalGallery";
import HospitalServices from "@/components/HospitalServices";
import TopDoctors from "@/components/TopDoctors";
import TopSection from "@/components/TopSection";
import UpcomingConsultations from "@/components/UpcomingConsultationsProps ";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notification.store";
import { router } from "expo-router";
import { Search } from 'lucide-react-native';
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from '../../components/HeaderText';

interface DoctorI {
    $id?: string;
    name: string;
    specialty: string;
    hourlyRate: number;
    image: string;
    experience: string;
    specialties: string[];
}

export const topDoctors: DoctorI[] = [
    {
        "name": "Dr. Shabnam Akhter",
        "specialty": "Kidney",
        "hourlyRate": 2100,
        "image": "https://i.ibb.co/mrybFMsP/doctor-white-coat-using-digital-tablet-reading-medical-data-gadget-working-hospital-standin.jpg",
        "experience": "Dr. Shabnam Akhter is a renowned nephrologist with 13 years of experience in kidney care and transplantation. She has expertise in managing chronic kidney disease, dialysis, and kidney transplant procedures. Her compassionate approach and clinical excellence have helped hundreds of patients maintain healthy kidney function.",
        "specialties": [
            "Kidney Transplantation - Comprehensive transplant care",
            "Dialysis Management - Both hemodialysis and peritoneal dialysis",
            "Chronic Kidney Disease - Early intervention and management"
        ],
        "$id": "688a76c2001cf58a30d1",
    },
    {
        "name": "Dr. Habibul Bashar",
        "specialty": "General Medicine",
        "hourlyRate": 1550,
        "image": "https://i.ibb.co/GjqqrMB/portrait-smiling-young-doctors-standing-together-portrait-medical-staff-inside-modern-hospital-smili.jpg",
        "experience": "Dr. Habibul Bashar is a dedicated general physician with 13 years of experience in emergency medicine and acute care. He provides comprehensive emergency medical services and urgent care treatment. His quick decision-making skills and broad medical knowledge have been crucial in managing medical emergencies and providing immediate patient care.",
        "specialties": [
            "Emergency Medicine - Acute medical care and trauma treatment",
            "Urgent Care - Immediate medical attention for non-life-threatening conditions",
            "Critical Care Support - Emergency stabilization and patient management"
        ],
        "$id": "688a76cb003cb3b87063",
    },
    {
        "name": "Dr. Mahmuda Khatun",
        "specialty": "Kidney",
        "hourlyRate": 1850,
        "image": "https://i.ibb.co/JjTdc4N8/woman-doctor-wearing-lab-coat-with-stethoscope-isolated.jpg",
        "experience": "Dr. Mahmuda Khatun is a compassionate nephrologist with 9 years of experience in women's kidney health and pregnancy-related kidney issues. She specializes in treating kidney diseases during pregnancy, preeclampsia, and reproductive health-related kidney problems. Her focus on women's nephrology has filled an important healthcare gap.",
        "specialties": [
            "Pregnancy-Related Kidney Disease - Kidney problems during pregnancy",
            "Women's Nephrology - Female-specific kidney health issues",
            "Preeclampsia Management - Pregnancy-induced hypertension and kidney involvement"
        ],
        "$id": "688a76cb0028e0327289",
    },
    {
        "name": "Dr. Nayeem Chowdhury",
        "specialty": "Lungs",
        "hourlyRate": 1800,
        "image": "https://images.pexels.com/photos/32115962/pexels-photo-32115962.jpeg",
        "experience": "Dr. Nayeem Chowdhury is a skilled pulmonologist with 12 years of experience in occupational lung diseases and environmental respiratory health. He specializes in treating work-related lung conditions, asbestos exposure effects, and environmental lung damage. His expertise in occupational health has been vital for industrial workers.",
        "specialties": [
            "Occupational Lung Disease - Work-related respiratory conditions",
            "Environmental Respiratory Health - Pollution-related lung damage",
            "Pulmonary Rehabilitation - Breathing exercises and lung function improvement"
        ],
        "$id": "688a76cb0011e958d1fc",
    }
];

export default function Index() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);

    const { user } = useAuthStore();
    const {
        unreadCount,
    } = useNotificationStore();

    type SpecialistName = keyof typeof images;

    const specialists: { id: number; name: SpecialistName }[] = [
        { id: 1, name: "dental" },
        { id: 2, name: "heart" },
        { id: 3, name: "liver" },
        { id: 4, name: "lungs" },
        { id: 5, name: "kidney" },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white px-4">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="py-4 pb-20">
                    {(user || unreadCount) && (
                        <TopSection user={user} unreadCount={unreadCount} />
                    )}

                    {/* Search modal trigger */}
                    <TouchableOpacity
                        onPress={() => setSearchModalVisible(true)}
                        className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-5 py-4 mb-4"
                        activeOpacity={0.95}
                    >
                        <Search color="#8E8E93" size={22} />
                        <Text className="flex-1 text-gray-400 font-medium text-base">
                            Find a doctor or specialist...
                        </Text>
                    </TouchableOpacity>

                    {user ? (
                        <UpcomingConsultations />
                    ) : (
                            <HospitalServices setSearchModalVisible={setSearchModalVisible} />
                    )}

                    <View className="mb-2">
                        <View className="flex-row items-center justify-between mb-4">
                            <HeaderText title="Service We Provide" />
                        </View>
                        <View className="flex-row justify-between px-3">
                            {specialists.map((specialist) => (
                                <TouchableOpacity key={specialist.id}>
                                    <Image
                                        source={images[specialist.name]}
                                        className="size-[50px] rounded-full items-center justify-center mb-2"
                                    />
                                    <Text className="text-gray-100 text-sm font-quicksand-medium text-center uppercase">
                                        {specialist.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TopDoctors
                        onViewAll={() => {
                            router.push('/doctors');
                        }}
                        topDoctors={topDoctors}
                    />

                    <HospitalGallery />

                    <DoctorSearchModal
                        visible={searchModalVisible}
                        onClose={() => setSearchModalVisible(false)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}