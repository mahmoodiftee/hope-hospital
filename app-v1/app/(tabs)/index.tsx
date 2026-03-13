import DoctorSearchModal from "@/components/DoctorSearchModal";
import HospitalGallery from "@/components/HospitalGallery";
import HospitalServices from "@/components/HospitalServices";
import SkeletonCard from "@/components/SkeletonCard";
import TopDoctors from "@/components/TopDoctors";
import TopSection from "@/components/TopSection";
import UpcomingConsultations from "@/components/UpcomingConsultationsProps";
import { images } from "@/constants";
import { useUserAppointments } from "@/hooks/useUserAppointments";
import useAuthStore from "@/store/auth.store";
import useNotificationStore from "@/store/notification.store";
import { topDoctorList } from "@/utils/topDoctors";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderText from "../../components/HeaderText";

interface DoctorI {
  $id?: string;
  name: string;
  specialty: string;
  hourlyRate: number;
  image: string;
  experience: string;
  specialties: string[];
}

const UserTopSection = () => {
  const { user, fetchAuthenticatedUser, isLoading } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (isLoading) {
    return (
      <View className="py-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 gap-2">
            <Skeleton
              colorMode="light"
              width={128}
              height={16}
              radius="round"
            />
            <Skeleton
              colorMode="light"
              width={192}
              height={24}
              radius="round"
            />
          </View>
          <Skeleton colorMode="light" width={48} height={48} radius="round" />
        </View>
      </View>
    );
  }

  if (user || unreadCount) {
    return <TopSection user={user} unreadCount={unreadCount} />;
  }

  return null;
};

const AppointmentsSection = ({
  setSearchModalVisible,
}: {
  setSearchModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { loading: appointmentsLoading, getUpcomingAppointments } =
    useUserAppointments();

  const upcomingAppointments = getUpcomingAppointments();

  if (appointmentsLoading) {
    return <SkeletonCard />;
  }

  if ((user || isAuthenticated) && upcomingAppointments.length > 0) {
    return (
      <UpcomingConsultations
        //@ts-ignore
        upcomingAppointments={upcomingAppointments}
        loading={appointmentsLoading}
      />
    );
  }

  return <HospitalServices setSearchModalVisible={setSearchModalVisible} />;
};

export default function Index() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  type SpecialistName = keyof typeof images;

  const specialists: { id: number; name: SpecialistName }[] = [
    { id: 1, name: "dental" },
    { id: 2, name: "heart" },
    { id: 3, name: "liver" },
    { id: 4, name: "lungs" },
    { id: 5, name: "kidney" },
  ];

  const topDoctors: DoctorI[] = topDoctorList;

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="py-4 pb-20">
          <UserTopSection />

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

          <AppointmentsSection setSearchModalVisible={setSearchModalVisible} />

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
              router.push("/doctors");
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
