import { AppointmentCard } from '@/components/Appointment/AppointmentCard'
import { getAppointments } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import useNotificationStore from '@/store/notification.store'
import { Appointment } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { AlertCircle, Calendar } from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
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
    const { user, fetchAuthenticatedUser } = useAuthStore()
    const { fetchUnreadCount, fetchNotifications } = useNotificationStore()

    const [refreshing, setRefreshing] = useState(false)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Ensure user is loaded
    useEffect(() => {
        if (!user) {
            fetchAuthenticatedUser()
        }
    }, [user, fetchAuthenticatedUser])

    const fetchAppointments = useCallback(async (phone?: string) => {
        if (!phone) {
            console.warn('No phone number provided for fetching appointments')
            return
        }

        try {
            setError(null)
            const result = await getAppointments({ phone })
            console.log('Fetched appointments:', result?.length || 0)
            setAppointments(result || [])
        } catch (err: any) {
            console.error('Error fetching appointments:', err)
            setError(err.message || 'Failed to fetch appointments')
        }
    }, [])

    // Initial fetch when user phone is available
    useEffect(() => {
        if (user?.phone && loading) {
            fetchAppointments(user.phone).finally(() => setLoading(false))
        }
    }, [user?.phone, loading, fetchAppointments])

    const onRefresh = useCallback(async () => {
        if (!user?.phone) {
            console.warn('No phone number available for refresh')
            return
        }

        console.log("Starting refresh...")
        setRefreshing(true)
        try {
            await fetchAppointments(user.phone)

            if (user?.id) {
                await fetchUnreadCount(user.id)
                await fetchNotifications(user.id)
            }
            console.log("Refresh completed successfully")
        } catch (error) {
            console.error('Error refreshing appointments:', error)
        } finally {
            setRefreshing(false)
        }
    }, [user?.phone, user?.id, fetchAppointments, fetchUnreadCount, fetchNotifications])

    const handleRefresh = useCallback(() => {
        if (user?.phone) {
            fetchAppointments(user.phone)
        }
    }, [user?.phone, fetchAppointments])

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        return <ErrorState error={error} onRetry={() => {
            setError(null)
            if (user?.phone) {
                setLoading(true)
                fetchAppointments(user.phone).finally(() => setLoading(false))
            }
        }} />
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
                            onRefresh={onRefresh}
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
                            onRefresh={onRefresh}
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
                                onRefresh={handleRefresh}
                            />
                        ))}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

// Reusable UI Components
const Header = () => (
    <View className="flex-row items-center">
        <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2"
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