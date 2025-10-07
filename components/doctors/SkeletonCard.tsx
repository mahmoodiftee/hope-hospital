import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export const SkeletonCard: React.FC = () => (
  <View style={styles.card} className="shadow-lg">
    <View className="flex-row gap-4 items-start mb-2.5">
      <Skeleton colorMode="light" width={80} height={100} radius={16} />
      <View className="flex-1 gap-2 mt-2">
        <Skeleton colorMode="light" width={128} height={20} radius="round" />
        <Skeleton colorMode="light" width={80} height={18} radius="round" />
        <Skeleton colorMode="light" width={60} height={13} radius="round" />
      </View>
    </View>
    <View className="flex-row gap-2">
      <View className="flex-1 h-10">
        <Skeleton colorMode="light" width={"100%"} height={35} radius={12} />
      </View>
      <View className="flex-1 h-10">
        <Skeleton colorMode="light" width={"100%"} height={35} radius={12} />
      </View>
      <Skeleton colorMode="light" width={35} height={35} radius={12} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
