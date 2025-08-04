import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    Modal,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    Share2,
    ZoomIn,
    ZoomOut,
    MoreVertical
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ImageViewerProps {
    images: string[];
    initialIndex: number;
    visible: boolean;
    onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
    images,
    initialIndex,
    visible,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [loading, setLoading] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const flatListRef = useRef<FlatList>(null);

    // Reset scale when modal opens/closes or image changes
    React.useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            setImageScale(1);
        }
    }, [visible, initialIndex]);

    React.useEffect(() => {
        setImageScale(1);
    }, [currentIndex]);

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

    const handleZoomIn = () => {
        setImageScale(prev => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        setImageScale(prev => Math.max(prev - 0.5, 0.5));
    };

    const onScroll = (event: any) => {
        const slideSize = screenWidth;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const renderImageItem = ({ item }: { item: string }) => (
        <View style={{
            width: screenWidth,
            height: screenHeight,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Image
                source={{ uri: item }}
                style={{
                    width: screenWidth,
                    height: screenHeight * 0.8,
                    transform: [{ scale: imageScale }]
                }}
                resizeMode="contain"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
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
                        <X color="white" size={24} />
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

                    <TouchableOpacity
                        onPress={() => Alert.alert('More Options', 'Additional options menu')}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            padding: 12,
                            borderRadius: 25
                        }}
                        activeOpacity={0.8}
                    >
                        <MoreVertical color="white" size={24} />
                    </TouchableOpacity>
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
                        length: screenWidth,
                        offset: screenWidth * index,
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
                    {/* Zoom Controls */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginBottom: 20,
                        gap: 15
                    }}>
                        <TouchableOpacity
                            onPress={handleZoomOut}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: 12,
                                borderRadius: 25
                            }}
                            activeOpacity={0.8}
                        >
                            <ZoomOut color="white" size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setImageScale(1)}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderRadius: 25
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                {Math.round(imageScale * 100)}%
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleZoomIn}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: 12,
                                borderRadius: 25
                            }}
                            activeOpacity={0.8}
                        >
                            <ZoomIn color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Navigation Controls */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
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
                            <ChevronLeft
                                color={currentIndex === 0 ? '#666' : 'white'}
                                size={24}
                            />
                        </TouchableOpacity>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity
                                onPress={handleShare}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: 12,
                                    borderRadius: 25
                                }}
                                activeOpacity={0.8}
                            >
                                <Share2 color="white" size={20} />
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
                                <Download color="white" size={20} />
                            </TouchableOpacity>
                        </View>

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
                            <ChevronRight
                                color={currentIndex === images.length - 1 ? '#666' : 'white'}
                                size={24}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Page Indicators */}
                    <View style={{
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
                    </View>
                </View>
            </View>
        </Modal>
    );
};