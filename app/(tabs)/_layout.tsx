import { TabBarIconProps } from "@/type";
import { Tabs } from "expo-router";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// import { BlurView } from "expo-blur";
import { Headset, Home, Stethoscope, User } from "lucide-react-native";
import { useEffect } from "react";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3.5;

const AnimatedTabBarIcon = ({
    focused,
    icon: Icon,
    title,
    onPress,
}: TabBarIconProps & { onPress: () => void }) => {
    const active = useSharedValue(focused ? 1 : 0);

    useEffect(() => {
        active.value = focused ? 1 : 0;
    }, [focused, active]);

    const containerStyle = useAnimatedStyle(() => {
        const width = interpolate(
            active.value,
            [0, 1],
            [60, TAB_WIDTH],
            Extrapolate.CLAMP
        );
        const paddingLeft = interpolate(
            active.value,
            [0, 1],
            [0, 16],
            Extrapolate.CLAMP
        );

        return {
            width: withSpring(width, {
                damping: 15,
                stiffness: 120,
            }),
            paddingLeft: withTiming(paddingLeft, { duration: 200 }),
            backgroundColor: active.value === 1 ? '#007AFF' : 'transparent',
            justifyContent: 'center',
        };
    });

    const iconStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            active.value,
            [0, 1],
            [1, 1.1],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ scale: withSpring(scale, { damping: 10, stiffness: 150 }) }],
            position: 'absolute',
            left: focused ? 20 : '50%', // Adjusted left position when focused
            marginLeft: focused ? 0 : -12, // Adjusted margin when not focused
        };
    });

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(active.value, { duration: 200 }),
            transform: [
                {
                    translateX: interpolate(
                        active.value,
                        [0, 1],
                        [-10, 0],
                        Extrapolate.CLAMP
                    ),
                },
            ],
            marginLeft: 30, // Added consistent margin between icon and text
        };
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Animated.View
                style={[
                    {
                        height: 50,
                        borderRadius: 25,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start", // Changed to flex-start
                        paddingRight: 12,
                        elevation: active.value === 1 ? 0 : 0,
                        position: 'relative',
                        overflow: 'hidden',
                    },
                    containerStyle,
                ]}
            >
                <Animated.View style={iconStyle}>
                    <Icon
                        size={24}
                        color={focused ? "rgba(255,255,255,0.9)" : "#007AFF"}
                        strokeWidth={2}
                    />
                </Animated.View>

                <Animated.View style={textStyle}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "rgba(255,255,255,0.9)",
                        }}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, navigation }: { state: any; navigation: any }) => {
    const tabs = [
        { name: "index", title: "Home", icon: Home },
        { name: "contact", title: "Contact", icon: Headset },
        { name: "doctors", title: "Doctors", icon: Stethoscope }, 
        { name: "profile", title: "Profile", icon: User },
    ];


    return (
        <View style={styles.tabBarContainer}>
            {/* <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} /> */}
            <View style={styles.tabItemsRow}>
                {tabs.map((tab, index) => {
                    const isFocused = state.index === index;

                    return (
                        <AnimatedTabBarIcon
                            key={tab.name}
                            focused={isFocused}
                            icon={tab.icon}
                            title={tab.title}
                            onPress={() => {
                                const event = navigation.emit({
                                    type: "tabPress",
                                    target: state.routes[index].key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(tab.name);
                                }
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom:10,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 1)",
        shadowColor: "#000",
        shadowRadius: 0,
        elevation: 40,
    },
    tabItemsRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 10,
    },
});

export default function TabLayout() {
    // const { isAuthenticated } = useAuthStore();

    // if (!isAuthenticated) return <Redirect href="/sign-in" />;

    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" options={{ title: "Home" }} />
            <Tabs.Screen name="contact" options={{ title: "Contact" }} />
            <Tabs.Screen name="doctors" options={{ title: "Doctors" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}