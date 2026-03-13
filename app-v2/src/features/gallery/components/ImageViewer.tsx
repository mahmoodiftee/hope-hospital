import React, { useRef, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const CARD_CONFIG = {
    width: windowWidth,
    height: windowHeight
};

export interface ImageViewerProps {
    images: string[];
    initialIndex: number;
    visible: boolean;
    onClose: () => void;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface ZoomableImageProps {
    uri: string;
    onLoadStart: () => void;
    onLoadEnd: () => void;
    isActive: boolean;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, onLoadStart, onLoadEnd, isActive }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Reset zoom when item becomes inactive
    useEffect(() => {
        if (!isActive) {
            scale.value = withTiming(1);
            savedScale.value = 1;
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        }
    }, [isActive]);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withTiming(1);
                savedScale.value = 1;
            } else if (scale.value > 3) {
                scale.value = withTiming(3);
                savedScale.value = 3;
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .minPointers(1)
        .onUpdate((event) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + event.translationX;
                translateY.value = savedTranslateY.value + event.translationY;
            }
        })
        .onEnd(() => {
            if (scale.value > 1) {
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            } else {
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
        };
    });

    return (
        <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
            <Animated.View style={[{ width: CARD_CONFIG.width, height: CARD_CONFIG.height * 0.8 }, animatedStyle]}>
                <AnimatedImage
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                />
            </Animated.View>
        </GestureDetector>
    );
};

export const ImageViewer: React.FC<ImageViewerProps> = ({
    images,
    initialIndex,
    visible,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
        }
    }, [visible, initialIndex]);

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        }
    };

    const handleShare = async () => {
        Alert.alert('Share', 'Share functionality would be implemented here');
    };

    const handleDownload = async () => {
        Alert.alert('Download', 'Download functionality would be implemented here');
    };

    const onScroll = (event: any) => {
        const slideSize = CARD_CONFIG.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const renderImageItem = ({ item, index }: { item: string, index: number }) => (
        <View style={{
            width: CARD_CONFIG.width,
            height: CARD_CONFIG.height,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden' // Important to prevent zoom overlap
        }}>
            <ZoomableImage
                uri={item}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                isActive={index === currentIndex}
            />
            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)'
                }}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            )}
        </View>
    );

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <StatusBar hidden />
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                {/* Header */}
                <View style={{
                    position: 'absolute',
                    top: 50,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20
                }}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 12,
                            borderRadius: 25
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" color="white" size={24} />
                    </TouchableOpacity>

                    <View style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: '600'
                        }}>
                            {currentIndex + 1} of {images.length}
                        </Text>
                    </View>

                    {/* <TouchableOpacity
                        onPress={() => Alert.alert('More Options', 'Additional options menu')}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 12,
                            borderRadius: 25
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="ellipsis-vertical" color="white" size={24} />
                    </TouchableOpacity> */}
                </View>

                {/* Image List */}
                <FlatList
                    ref={flatListRef}
                    data={images}
                    renderItem={renderImageItem}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    initialScrollIndex={initialIndex}
                    getItemLayout={(_, index) => ({
                        length: CARD_CONFIG.width,
                        offset: CARD_CONFIG.width * index,
                        index
                    })}
                />

                {/* Bottom Controls */}
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    paddingVertical: 20,
                    paddingHorizontal: 20
                }}>
                    {/* Navigation Controls */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center'
                    }}>
                        {/* Previous Button */}
                        <TouchableOpacity
                            onPress={goToPrev}
                            disabled={currentIndex === 0}
                            style={{
                                backgroundColor: currentIndex === 0
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(255,255,255,0.2)',
                                padding: 15,
                                borderRadius: 25
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chevron-back" color={currentIndex === 0 ? '#666' : 'white'} size={24} />
                        </TouchableOpacity>

                        {/* Action Buttons */}
                        {/* <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity
                                onPress={handleShare}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: 12,
                                    borderRadius: 25
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="share-social" color="white" size={20} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDownload}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: 12,
                                    borderRadius: 25
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="download" color="white" size={20} />
                            </TouchableOpacity>
                        </View> */}

                        {/* Next Button */}
                        <TouchableOpacity
                            onPress={goToNext}
                            disabled={currentIndex === images.length - 1}
                            style={{
                                backgroundColor: currentIndex === images.length - 1
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'rgba(255,255,255,0.2)',
                                padding: 15,
                                borderRadius: 25
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="chevron-forward" color={currentIndex === images.length - 1 ? '#666' : 'white'} size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Page Indicators */}
                    {/* <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginTop: 15,
                        gap: 6
                    }}>
                        {images.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setCurrentIndex(index);
                                    flatListRef.current?.scrollToIndex({
                                        index,
                                        animated: true
                                    });
                                }}
                                style={{
                                    width: index === currentIndex ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: index === currentIndex
                                        ? '#3B82F6'
                                        : 'rgba(255,255,255,0.3)'
                                }}
                            />
                        ))}
                    </View> */}
                </View>
            </View>
        </Modal>
    );
};
