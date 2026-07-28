import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
    children: ReactNode;
};

type State = {
    error: Error | null;
};

/**
 * Catches render-time JS errors so the app shows a recovery UI
 * instead of an immediate white-screen / process kill.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    private handleRetry = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>
                    Something went wrong
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        color: '#64748B',
                        textAlign: 'center',
                        marginBottom: 20,
                        lineHeight: 20,
                    }}
                >
                    {error.message || 'The app hit an unexpected error on launch.'}
                </Text>
                <TouchableOpacity
                    onPress={this.handleRetry}
                    style={{
                        backgroundColor: '#2563EB',
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Try again</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
