import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { Tabs, usePathname, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ─── Tab configuration ────────────────────────────────────────────────
const TAB_CONFIG = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home-outline' as const,
    iconActive: 'home' as const,
  },
  {
    name: 'contact',
    title: 'Contact',
    icon: 'headset-outline' as const,
    iconActive: 'headset' as const,
  },
  {
    name: 'doctors',
    title: 'Doctors',
    icon: 'medical-outline' as const,
    iconActive: 'medical' as const,
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline' as const,
    iconActive: 'person' as const,
  },
]

// ─── Colors ───────────────────────────────────────────────────────────
const COLORS = {
  active: '#0A84FF',
  inactive: '#A0A5B0',
  activeBg: 'rgba(10, 132, 255, 0.10)',
  white: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.06)',
}

// ─── Single tab button ───────────────────────────────────────────────
function TabButton({
  label,
  icon,
  iconActive,
  isFocused,
  onPress,
  onLongPress,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
}) {
  const scale = useSharedValue(1)
  const bgOpacity = useSharedValue(isFocused ? 1 : 0)

  useEffect(() => {
    bgOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 })
  }, [isFocused])

  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: `rgba(10, 132, 255, ${0.1 * bgOpacity.value})`,
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.tabInner, animatedBg]}>
        <Ionicons
          name={isFocused ? iconActive : icon}
          size={22}
          color={isFocused ? COLORS.active : COLORS.inactive}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? COLORS.active : COLORS.inactive,
              fontWeight: isFocused ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  )
}

// ─── Custom tab bar ──────────────────────────────────────────────────
function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any
  descriptors: any
  navigation: any
}) {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <View
      style={[
        styles.tabBarOuter,
        {
          // This is the key: paddingBottom uses the device's actual
          // safe area inset, so it automatically adjusts for home
          // indicators, gesture bars, and navigation buttons.
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 0}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      {/* Thin top separator */}
      <View style={styles.separator} />

      {/* Tab buttons row */}
      <View style={styles.tabRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key]
          const isFocused = state.index === index
          const config = TAB_CONFIG[index]

          if (!config) return null

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              // Special handling for doctors tab: always reset
              if (route.name === 'doctors') {
                router.replace('/doctors')
              } else {
                navigation.navigate(route.name, route.params)
              }
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          return (
            <TabButton
              key={route.key}
              label={config.title}
              icon={config.icon}
              iconActive={config.iconActive}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          )
        })}
      </View>
    </View>
  )
}

// ─── Tab layout ──────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="contact" />
      <Tabs.Screen name="doctors" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.97)',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
})
