import { CARD_CONFIG } from "@/utils/constants";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";

const SkeletonCard = () => (
  <View
    style={{
      width: CARD_CONFIG.width,
      marginRight: CARD_CONFIG.margin,
      padding: 10,
      paddingBottom: 20,
    }}
    className="rounded-2xl overflow-hidden"
  >
    {/* Top Row: Avatar + Text */}
    <View className="flex-row items-center relative z-10">
      <Skeleton colorMode="light" width={48} height={48} radius="round" />

      <View className="flex-1 ml-3 gap-2">
        <Skeleton
          colorMode="light"
          width={128}
          height={20}
          radius="round"
          style={{ marginBottom: 8 }}
        />
        <Skeleton colorMode="light" width={192} height={16} radius="round" />
      </View>
    </View>

    {/* Middle Controls */}
    <View className="flex-row justify-between items-end mt-4 z-10">
      <View className="flex-1 gap-2">
        <Skeleton
          colorMode="light"
          width={220}
          height={25}
          radius="round"
          style={{ marginBottom: 8 }}
        />
        <Skeleton
          colorMode="light"
          width={220}
          height={25}
          radius="round"
          style={{ marginBottom: 8 }}
        />
      </View>

      <View className="flex-row items-center gap-1.5 ml-2">
        <Skeleton colorMode="light" width={40} height={40} radius="round" />
        <Skeleton colorMode="light" width={40} height={40} radius="round" />
      </View>
    </View>
  </View>
);

export default SkeletonCard;
