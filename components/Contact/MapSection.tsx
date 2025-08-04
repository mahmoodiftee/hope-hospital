import { hospitalConfig } from '@/config/hospitalConfig';
import { contactUtils } from '@/utils/contactUtils';
import { MapPin, Navigation } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export const MapSection: React.FC = () => {
    const { coordinates } = hospitalConfig.hospital;
    const { title, description, deltaLat, deltaLng } = hospitalConfig.map;

    return (
        <View className="mb-6">
            <View
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={hospitalConfig.ui.shadows.default}
            >
                <View className="flex-row items-center mb-4">
                    <MapPin size={24} color={hospitalConfig.ui.colors.gray} strokeWidth={2} />
                    <Text className="text-dark-100 text-xl font-bold ml-2">Find Us</Text>
                </View>

                <View className="rounded-xl h-48 overflow-hidden mb-4">
                    <MapView
                        style={{ flex: 1 }}
                        initialRegion={{
                            latitude: coordinates.lat,
                            longitude: coordinates.lng,
                            latitudeDelta: deltaLat,
                            longitudeDelta: deltaLng,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: coordinates.lat,
                                longitude: coordinates.lng
                            }}
                            title={title}
                            description={description}
                        />
                    </MapView>
                </View>

                <TouchableOpacity
                    className="bg-[#007AFF] rounded-xl p-4 active:bg-blue-700 flex-row items-center justify-center"
                    onPress={contactUtils.handleMapDirections}
                >
                    <Navigation size={20} color={hospitalConfig.ui.colors.white} strokeWidth={2} />
                    <Text className="text-white text-base font-semibold ml-2">
                        Get Directions
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
