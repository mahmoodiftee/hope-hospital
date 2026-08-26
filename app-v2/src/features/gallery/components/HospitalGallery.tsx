import { HeaderText } from '@/shared/components'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export const demoGalleryImages = [
  // Hope Hospital photos (Appwrite Storage)
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b24a2003b4b8c0edc/view?project=687534a40002a65f2150', // exterior
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b24a5000344f20003/view?project=687534a40002a65f2150', // dental
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b24a50024bc35246e/view?project=687534a40002a65f2150', // ultrasound
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b24a60008eeec913b/view?project=687534a40002a65f2150', // radiology
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b24a6002b22477962/view?project=687534a40002a65f2150', // OT
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c00119e458352/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c00119fe17c19/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c00119d2cf701/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c00119ec2d094/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c001197e2f949/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/691c5f6e001de2ba402c/files/6a8b309c001199f44dcd/view?project=687534a40002a65f2150&impersonateuserid=&mode=admin',

  // Previous Unsplash placeholders
  // 'https://plus.unsplash.com/premium_photo-1681843126728-04eab730febe?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://plus.unsplash.com/premium_photo-1664304370934-b21ea9e0b1f5?q=80&w=683&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://plus.unsplash.com/premium_photo-1661895714925-2c7a6be6be32?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1640876777002-badf6aee5bcc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1565594090530-d1ebc05b54b1?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://plus.unsplash.com/premium_photo-1661894592852-5cfb513eefb4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1631507623121-eaaba8d4e7dc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://plus.unsplash.com/premium_photo-1681995326134-cdc947934015?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://plus.unsplash.com/premium_photo-1681967103563-871828436e1d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1168&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // 'https://images.unsplash.com/photo-1670665352618-49ae2ae914ff?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
]

export const HospitalGallery: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const navigateToGallery = () => router.push('/gallery' as any)

  return (
    <View className="mb-6">
      <View className="mb-4 px-1">
        <HeaderText title={t('gallery.title')} className="mb-0" />
      </View>

      <View className="">
        {/* Top Landscape Image */}
        <TouchableOpacity
          className="mb-3 h-44 w-full overflow-hidden rounded-[24px] border border-gray-100/50 bg-gray-100 shadow-md shadow-blue-500/10"
          onPress={navigateToGallery}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: demoGalleryImages[0] }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'transparent']}
            className="absolute left-0 right-0 top-0 h-1/2"
          />
        </TouchableOpacity>

        {/* First Row */}
        <View className="mb-2 flex-row justify-between">
          {demoGalleryImages.slice(1, 4).map((img, index) => (
            <TouchableOpacity
              key={`row1-${index}`}
              className="h-24 w-[32%] overflow-hidden rounded-2xl border border-gray-100/50 bg-gray-100 shadow-sm shadow-blue-500/10"
              onPress={navigateToGallery}
              activeOpacity={0.9}
            >
              <Image source={{ uri: img }} className="h-full w-full" resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent']}
                className="absolute left-0 right-0 top-0 h-1/2"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Second Row */}
        <View className="mb-4 flex-row justify-between">
          {demoGalleryImages.slice(4, 7).map((img, index) => (
            <TouchableOpacity
              key={`row2-${index}`}
              className="h-24 w-[32%] overflow-hidden rounded-2xl border border-gray-100/50 bg-gray-100 shadow-sm shadow-blue-500/10"
              onPress={navigateToGallery}
              activeOpacity={0.9}
            >
              <Image source={{ uri: img }} className="h-full w-full" resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'transparent']}
                className="absolute left-0 right-0 top-0 h-1/2"
              />
              {index === 2 && (
                <View className="absolute inset-0 items-center justify-center bg-blue-600/40 backdrop-blur-sm">
                  <View className="rounded-xl border border-white/50 bg-white/90 px-3 py-1.5">
                    <Text className="text-xs font-black text-blue-600">
                      {t('gallery.more', { count: demoGalleryImages.length - 7 })}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}
