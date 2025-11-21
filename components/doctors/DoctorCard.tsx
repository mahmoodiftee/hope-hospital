import { Doctor } from "@/types";
import { PhoneCall, Stethoscope, Tag } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CachedSkeletonImage } from "../SkeletonImage";

interface DoctorCardProps {
  doctor: Doctor;
  onBookNow: () => void;
  onViewDetails: () => void;
  onCall?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBookNow,
  onViewDetails,
  onCall,
}) => {
  return (
    <View className="shadow-[0_5px_10px_rgba(0,0,0,0.1)]" style={styles.card}>
      <View className="flex-row gap-4 items-center justify-start mb-2.5">
        <CachedSkeletonImage
          uri={doctor.image}
          width={80}
          height={80}
          radius={12}
          style={{ marginRight: 16 }}
        />

        <View style={{ flex: 1 }} className="h-full items-start pt-4">
          <Text className="text-2xl font-medium text-dark mb-0">
            {doctor.name}
          </Text>
          <View className="flex-row gap-2 items-center opacity-80 mb-0">
            <Stethoscope size={17} strokeWidth={2} />
            <Text className="text-xl">{doctor.specialty}</Text>
          </View>
          <View className="flex-row gap-1 items-center opacity-80">
            <Tag size={17} strokeWidth={2} />
            <Text className="text-lg">{doctor.hourlyRate}</Text>
            <Text className="text-lg mt-1">৳</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity
          className="bg-blue flex-1 py-3 rounded-xl mr-2"
          onPress={onBookNow}
        >
          <Text className="text-white text-center font-semibold">Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-gray-100/50 flex-1 py-3 rounded-xl mr-2"
          onPress={onViewDetails}
        >
          <Text className="text-center font-semibold text-gray-800">
            Detail
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2.5 border border-gray-100/50 rounded-xl"
          onPress={onCall}
        >
          <PhoneCall size={18} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
