import { Image as ExpoImage } from "expo-image";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";

interface SkeletonImageProps {
  uri: string;
  width: number;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  cachePolicy?: "memory" | "disk" | "memory-disk" | "none";
  useExpoImage?: boolean; 
}

export const CachedSkeletonImage: React.FC<SkeletonImageProps> = ({
  uri,
  width,
  height,
  radius = 16,
  style,
  cachePolicy = "memory-disk",
  useExpoImage = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (uri) {
      setLoading(true);
      setError(false);
      setImageKey((prev) => prev + 1);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setLoading(false);
          setError(true);
        }
      }, 100);
    }
  }, [uri]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLoadStart = () => {
    if (mountedRef.current) {
      setLoading(true);
      setError(false);
    }
  };

  const handleLoad = () => {
    if (mountedRef.current) {
      setLoading(false);
      setError(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleError = (e: any) => {
    if (mountedRef.current) {
      setLoading(false);
      setError(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  if (!uri || uri.trim() === "") {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius: radius,
            overflow: "hidden",
            backgroundColor: "#f0f0f0",
          },
          style,
        ]}
      >
        <Skeleton
          colorMode="light"
          width={width}
          height={height}
          radius={radius}
        />
      </View>
    );
  }

  const imageStyle = {
    width,
    height,
    borderRadius: radius,
    opacity: loading ? 0 : 1,
    backgroundColor: error ? "#f0f0f0" : "transparent",
  };

  return (
    <View
      style={[
        { width, height, borderRadius: radius, overflow: "hidden" },
        style,
      ]}
    >
      {useExpoImage ? (
        <ExpoImage
          key={`expo-${imageKey}-${uri}`}
          source={{ uri }}
          style={imageStyle}
          contentFit="cover"
          cachePolicy={cachePolicy}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          recyclingKey={uri}
          priority="high"
          placeholder={require("@/assets/images/doctorplaceholder.png")}
          transition={{ duration: 200, effect: "cross-dissolve" }}
        />
      ) : (
        <Image
          key={`rn-${imageKey}-${uri}`}
          source={{
            uri,
            cache: "force-cache",
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          }}
          style={imageStyle}
          resizeMode="cover"
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
            borderRadius: radius,
          }}
        >
          <Skeleton
            colorMode="light"
            width={width}
            height={height}
            radius={radius}
          />
        </View>
      )}
    </View>
  );
};
