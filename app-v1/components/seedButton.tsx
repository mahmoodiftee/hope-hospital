import seedAppointments from "@/lib/seedAppointments";
import seedReviews from "@/lib/seedReviews";
import seedAvailableSlots from "@/lib/seedSlot";
import seedUsers from "@/lib/seedUsers";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

const SeedReviewsButton = () => {
    const [loading, setLoading] = useState(false);

    const handleSeedReviews = async () => {
        try {
            setLoading(true);
            await seedReviews();
            Alert.alert("Success", "Reviews seeded successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to seed reviews.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20, alignItems: "center" }}>
            <TouchableOpacity
                onPress={handleSeedReviews}
                disabled={loading}
                style={{
                    backgroundColor: loading ? "#999" : "#28a745",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                }}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16 }}>Seed Reviews</Text>}
            </TouchableOpacity>
        </View>
    );
};

export default SeedReviewsButton;
