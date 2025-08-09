import { Tabs } from "expo-router";
import { Headset, Home, Stethoscope, User } from "lucide-react-native";
import { Pressable } from "react-native";

const CustomTabButton = ({ children, onPress, ...props }: any) => (
    <Pressable onPress={onPress} android_ripple={null} style={props.style}>
        {children}
    </Pressable>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E5E5E7',
                    borderTopWidth: 1,
                    height: 84,
                    paddingBottom: 20,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    // marginTop: 4,
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} strokeWidth={2} />
                    ),
                    tabBarButton: (props) => <CustomTabButton {...props} />,
                }} 
            />
            <Tabs.Screen 
                name="contact" 
                options={{ 
                    title: "Contact",
                    tabBarIcon: ({ color, size }) => (
                        <Headset size={size} color={color} strokeWidth={2} />
                    ),
                    tabBarButton: (props) => <CustomTabButton {...props} />,
                }} 
            />
            <Tabs.Screen 
                name="doctors" 
                options={{ 
                    title: "Doctors",
                    tabBarIcon: ({ color, size }) => (
                        <Stethoscope size={size} color={color} strokeWidth={2} />
                    ),
                    tabBarButton: (props) => <CustomTabButton {...props} />,
                }} 
            />
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <User size={size} color={color} strokeWidth={2} />
                    ),
                    tabBarButton: (props) => <CustomTabButton {...props} />,
                }} 
            />
        </Tabs>
    );
}