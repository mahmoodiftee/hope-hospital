import { AppointmentCard } from '@/components/Appointment/AppointmentCard'
import { useUserAppointments } from '@/hooks/useUserAppointments'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { AlertCircle, Calendar } from 'lucide-react-native'
import React from 'react'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Appointments = () => {
    const {
        appointments,
        loading,
        refreshing,
        error,
        refresh,
        refreshAppointments,
        retry
    } = useUserAppointments()

    if (loading && appointments.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        )
    }

    if (error && appointments.length === 0) {
        return <ErrorState error={error} onRetry={retry} />
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header />

            {appointments.length === 0 ? (
                <ScrollView
                    contentContainerStyle={{ flex: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                >
                    <EmptyState />
                </ScrollView>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                >
                    <View className="pb-24">
                        {appointments.map((appointment, index) => (
                            <AppointmentCard
                                key={`${appointment.$id}-${index}`}
                                appointment={appointment}
                                onRefresh={refreshAppointments}
                            />
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

// Reusable UI Components (unchanged)
const Header = () => (
    <View className="flex-row items-center py-3 mx-4">
        <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-white shadow-sm"
        >
            <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View>
            <Text className="text-2xl font-bold text-gray-900">My Appointments</Text>
        </View>
    </View>
)

const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
        <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6">
            <Calendar size={32} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-semibold text-dark-100 mb-3 text-center">
            Your healthcare journey starts here
        </Text>
        <Text className="text-gray-500 text-center text-base leading-6 mb-8">
            Book your first appointment with qualified doctors. Get the care you deserve, when you need it.
        </Text>
        <TouchableOpacity
            className="bg-blue-500 px-8 py-4 rounded-2xl"
            activeOpacity={0.9}
            onPress={() => router.push('/doctors')}
        >
            <Text className="text-white font-semibold text-base">
                Find doctors
            </Text>
        </TouchableOpacity>
    </View>
)

const ErrorState: React.FC<{
    error: string
    onRetry: () => void
}> = ({ error, onRetry }) => (
    <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-8">
            <View className="w-16 h-16 bg-red-50 rounded-2xl items-center justify-center mb-4">
                <AlertCircle size={28} color="#dc2626" />
            </View>
            <Text className="text-xl font-semibold text-dark-100 mb-2 text-center">
                Can&apos;t load your appointments
            </Text>
            <Text className="text-gray-500 text-center mb-4">
                {error}
            </Text>
            <TouchableOpacity
                className="bg-blue-500 px-6 py-3 rounded-xl"
                onPress={onRetry}
            >
                <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
)

export default Appointments