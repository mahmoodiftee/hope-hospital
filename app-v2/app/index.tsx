import { Redirect } from 'expo-router';

// Entry point — redirects to tabs home immediately.
// Auth gate lives inside (tabs)/_layout.tsx.
export default function Index() {
    return <Redirect href="/(tabs)" />;
}
