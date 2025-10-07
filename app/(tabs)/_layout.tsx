import { Tabs, usePathname, useRouter } from "expo-router";
import { Headset, Home, Stethoscope, User } from "lucide-react-native";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get("window");
  const router = useRouter();
  const pathname = usePathname();

  // Professional tab bar height calculation used by major apps
  const getOptimalTabBarHeight = () => {
    const STANDARD_TAB_HEIGHT = 49; // iOS Human Interface Guidelines standard
    const ANDROID_TAB_HEIGHT = 56; // Material Design standard

    if (Platform.OS === "ios") {
      // iPhone models with home indicator need extra space
      if (insets.bottom > 0) {
        return STANDARD_TAB_HEIGHT + insets.bottom;
      }
      // iPhone models with home button (iPhone SE, iPhone 8, etc.)
      return STANDARD_TAB_HEIGHT + 16; // Standard safe padding
    } else {
      // Android devices
      return ANDROID_TAB_HEIGHT + Math.max(insets.bottom, 8);
    }
  };

  // Calculate perfect padding that works on all devices
  const getBottomPadding = () => {
    if (Platform.OS === "ios") {
      // Use device safe area if available, otherwise standard padding
      return insets.bottom > 0 ? insets.bottom : 16;
    } else {
      // Android: handle gesture navigation and traditional nav bars
      return Math.max(insets.bottom, 8);
    }
  };

  // Professional icon sizing based on platform
  const getIconSize = () => {
    return Platform.OS === "ios" ? 25 : 24;
  };

  // Handle doctors tab press to reset to index
  const handleDoctorsTabPress = () => {
    // If we're already on a doctor detail page or not on doctors index, reset to index
    if (pathname.includes("/doctors/") || pathname !== "/doctors") {
      router.replace("/doctors");
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",

          // THE MAGIC: Professional height calculation
          height: getOptimalTabBarHeight(),

          // Perfect padding for any device
          paddingBottom: getBottomPadding(),
          paddingTop: Platform.OS === "ios" ? 6 : 8,
          paddingHorizontal: 0,

          // Remove any system-added margins
          margin: 0,

          // Border styling (matches iOS/Android standards)
          borderTopWidth: Platform.OS === "ios" ? 0.5 : 1,
          borderTopColor: Platform.OS === "ios" ? "#C6C6C8" : "#E1E1E1",

          // Remove shadows/elevation that add visual weight
          elevation: Platform.OS === "android" ? 8 : 0,
          shadowOpacity: Platform.OS === "ios" ? 0.1 : 0,
          shadowOffset:
            Platform.OS === "ios"
              ? { width: 0, height: -2 }
              : { width: 0, height: 0 },
          shadowRadius: Platform.OS === "ios" ? 8 : 0,

          // Ensure tab bar stays at bottom on all devices
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },

        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 10 : 12,
          fontWeight: Platform.OS === "ios" ? "500" : "600",
          marginTop: 2,
          marginBottom: 0,
          letterSpacing: Platform.OS === "ios" ? 0.1 : 0,
        },

        tabBarItemStyle: {
          // Distribute items evenly
          flex: 1,
          // Remove default padding that creates extra space
          paddingTop: 4,
          paddingBottom: 0,
          // Center content perfectly
          justifyContent: "center",
          alignItems: "center",
        },

        // Professional color scheme (iOS & Android standards)
        tabBarActiveTintColor: Platform.OS === "ios" ? "#007AFF" : "#1976D2",
        tabBarInactiveTintColor: Platform.OS === "ios" ? "#8E8E93" : "#757575",

        // Handle keyboard properly on both platforms
        tabBarHideOnKeyboard: Platform.OS === "android",

        // Background handling for different devices
        tabBarBackground: () => null, // Let tabBarStyle handle background
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home
              size={getIconSize()}
              color={color}
              strokeWidth={Platform.OS === "ios" ? 1.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color, size }) => (
            <Headset
              size={getIconSize()}
              color={color}
              strokeWidth={Platform.OS === "ios" ? 1.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: "Doctors",
          tabBarIcon: ({ color, size }) => (
            <Stethoscope
              size={getIconSize()}
              color={color}
              strokeWidth={Platform.OS === "ios" ? 1.5 : 2}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Prevent default navigation
            handleDoctorsTabPress();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User
              size={getIconSize()}
              color={color}
              strokeWidth={Platform.OS === "ios" ? 1.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
