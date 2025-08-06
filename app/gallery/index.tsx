import { demoGalleryImages } from '@/components/HospitalGallery';
import { ImageViewer } from '@/components/ImageViewer';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface ImageDimensions {
    width: number;
    height: number;
}

interface MasonryItem {
    uri: string;
    dimensions: ImageDimensions;
    originalIndex: number;
    loaded: boolean;
}

// Skeleton component for loading state
const SkeletonItem: React.FC<{ height: number }> = ({ height }) => (
    <View className="w-full bg-gray-100 rounded-xl mb-4 overflow-hidden" style={{ height }}>
        <LinearGradient
            colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-1 opacity-80"
        >
            <View className="flex-1 justify-center items-center">
                <View className="w-10 h-10 bg-gray-300 rounded-full opacity-50" />
            </View>
        </LinearGradient>
    </View>
);

const GalleryScreen: React.FC = () => {
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [masonryItems, setMasonryItems] = useState<MasonryItem[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [allLoadedImages, setAllLoadedImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 8;
    const columnWidth = (screenWidth - 30) / 2;

    // Fetch images function
    const fetchImages = useCallback(async (page: number): Promise<string[]> => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const startIndex = page * ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, demoGalleryImages.length);

            if (startIndex >= demoGalleryImages.length) {
                return [];
            }

            return demoGalleryImages.slice(startIndex, endIndex);
        } catch (error: any) {
            throw error;
        }
    }, []);

    // Load image dimensions
    const loadImageDimensions = useCallback(async (imageUris: string[], startIndex: number): Promise<MasonryItem[]> => {
        const itemsWithDimensions = await Promise.all(
            imageUris.map(async (uri, index) => {
                const dimensions = await new Promise<ImageDimensions>((resolve) => {
                    Image.getSize(
                        uri,
                        (width, height) => resolve({ width, height }),
                        () => resolve({ width: 300, height: 200 })
                    );
                });

                const aspectRatio = dimensions.width / dimensions.height;
                const scaledHeight = columnWidth / aspectRatio;

                return {
                    uri,
                    dimensions: { width: columnWidth, height: scaledHeight },
                    originalIndex: startIndex + index,
                    loaded: false
                };
            })
        );

        return itemsWithDimensions;
    }, [columnWidth]);

    // Load more images
    const loadMoreImages = useCallback(async () => {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const newImageUris = await fetchImages(currentPage);

            if (newImageUris.length === 0) {
                setHasMore(false);
                return;
            }

            const startIndex = allLoadedImages.length;
            const newItems = await loadImageDimensions(newImageUris, startIndex);

            // Add new items to the existing array
            setMasonryItems(prev => [...prev, ...newItems]);

            // Update loaded images list
            setAllLoadedImages(prev => [...prev, ...newImageUris]);

            // Update page counter
            setCurrentPage(prev => prev + 1);

            // Check if we've loaded all available images
            if (allLoadedImages.length + newImageUris.length >= demoGalleryImages.length) {
                setHasMore(false);
            }

        } catch (error: any) {
            setError(error.message || 'Failed to load images');
        } finally {
            setLoading(false);
        }
    }, [currentPage, loading, hasMore, allLoadedImages.length, fetchImages, loadImageDimensions]);

    // Initial load
    useEffect(() => {
        loadMoreImages();
    }, []);

    // Handle image press
    const handleImagePress = (originalIndex: number) => {
        setSelectedImageIndex(originalIndex);
        setViewerVisible(true);
    };

    // Handle image load
    const handleImageLoad = useCallback((item: MasonryItem) => {
        setMasonryItems(prev =>
            prev.map(i =>
                i.originalIndex === item.originalIndex
                    ? { ...i, loaded: true }
                    : i
            )
        );
    }, []);

    // Render individual masonry item
    const renderMasonryItem = (item: MasonryItem) => (
        <View key={item.originalIndex} className="mb-4">
            {!item.loaded && (
                <SkeletonItem height={item.dimensions.height} />
            )}
            <TouchableOpacity
                className="rounded-xl overflow-hidden bg-gray-50 shadow-sm"
                style={{
                    width: item.dimensions.width,
                    height: item.dimensions.height,
                    position: item.loaded ? 'relative' : 'absolute',
                    top: item.loaded ? 0 : -item.dimensions.height - 15,
                    opacity: item.loaded ? 1 : 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
                onPress={() => handleImagePress(item.originalIndex)}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: item.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                    onLoad={() => handleImageLoad(item)}
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent']}
                    className="absolute top-0 left-0 right-0"
                    style={{ height: '40%' }}
                />
            </TouchableOpacity>
        </View>
    );

    // Distribute items into two columns for masonry layout
    const { leftColumnItems, rightColumnItems } = React.useMemo(() => {
        const left: MasonryItem[] = [];
        const right: MasonryItem[] = [];
        let leftHeight = 0;
        let rightHeight = 0;

        masonryItems.forEach(item => {
            if (leftHeight <= rightHeight) {
                left.push(item);
                leftHeight += item.dimensions.height + 15;
            } else {
                right.push(item);
                rightHeight += item.dimensions.height + 15;
            }
        });

        return { leftColumnItems: left, rightColumnItems: right };
    }, [masonryItems]);

    // Render masonry column
    const renderMasonryColumn = (items: MasonryItem[]) => (
        <View className="flex-1">
            {items.map(renderMasonryItem)}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View className="flex-row items-center px-3 py-2 border-b-4 border-gray-50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 rounded-full bg-gray-50"
                    activeOpacity={0.7}
                >
                    <ChevronLeft color="#333" size={24} />
                </TouchableOpacity>

                <Text className="text-xl font-bold text-gray-800 flex-1">
                    Gallery
                </Text>

                <Text className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-xl">
                    {allLoadedImages.length} / {demoGalleryImages.length} Photos
                </Text>
            </View>

            {/* Masonry Gallery */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingTop: 15,
                    paddingBottom: 30
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Initial loading state */}
                {allLoadedImages.length === 0 && loading && (
                    <View className="flex-row gap-4 items-start">
                        <View className="flex-1">
                            <SkeletonItem height={200} />
                            <SkeletonItem height={160} />
                            <SkeletonItem height={180} />
                        </View>
                        <View className="flex-1">
                            <SkeletonItem height={180} />
                            <SkeletonItem height={200} />
                            <SkeletonItem height={160} />
                        </View>
                    </View>
                )}

                {(leftColumnItems.length > 0 || rightColumnItems.length > 0) && (
                    <View className="flex-row gap-4 items-start">
                        {renderMasonryColumn(leftColumnItems)}
                        {renderMasonryColumn(rightColumnItems)}
                    </View>
                )}

                {hasMore && !loading && allLoadedImages.length > 0 && (
                    <TouchableOpacity
                        onPress={loadMoreImages}
                        className="bg-blue-500 py-2 mt-3 rounded-xl items-center"
                    >
                        <Text className="text-white font-semibold text-base">
                            Load More Photos
                        </Text>
                    </TouchableOpacity>
                )}

                {loading && allLoadedImages.length > 0 && (
                    <View className="py-8 items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="mt-2 text-gray-600 text-sm">
                            Loading more images...
                        </Text>
                    </View>
                )}

                {error && (
                    <View className="py-5 px-5 items-center">
                        <Text className="text-red-500 text-sm text-center mb-2">
                            {error}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setError(null);
                                loadMoreImages();
                            }}
                            className="bg-blue-500 px-5 py-2 rounded-full"
                        >
                            <Text className="text-white text-sm">
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!hasMore && allLoadedImages.length > 0 && (
                    <View className="py-8 items-center">
                        <Text className="text-gray-600 text-sm text-center">
                            You&apos;ve seen all the photos
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Image Viewer Modal */}
            <ImageViewer
                images={allLoadedImages}
                initialIndex={selectedImageIndex}
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
            />
        </SafeAreaView>
    );
};

export default GalleryScreen;