import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface ContactCardProps {
  icon: React.ComponentType<any>
  title: string
  subtitle: string
  onPress: () => void
  bgColor?: string
  iconColor?: string
  titleColor?: string
  isEmergency?: boolean
  isLast?: boolean
}

export const ContactCard: React.FC<ContactCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  isEmergency = false,
  isLast = false,
}) => {
  if (isEmergency) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
        <LinearGradient
          colors={['#FF6B6B', '#EE5A5A', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 22,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              position: 'absolute',
              right: -20,
              top: -20,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 40,
              bottom: -30,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Icon size={26} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  fontFamily: 'Quicksand-Bold',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontFamily: 'Quicksand-SemiBold',
                  lineHeight: 21,
                }}
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Ionicons name="call" size={20} color="#DC2626" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F1F5F9',
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        marginBottom: 5,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: '#F8FAFC',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Icon size={18} color="#475569" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'Quicksand-Bold',
            color: '#0F172A',
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: 'Quicksand-Medium',
            color: '#64748B',
          }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  )
}
