import { hospitalConfig } from '@/config/hospitalConfig';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const HospitalAddress: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View
            style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 20,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'flex-start',
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                }}
            >
                <Ionicons name="location-outline" size={18} color="#64748B" />
            </View>
            <View style={{ flex: 1, paddingTop: 2 }}>
                <Text
                    style={{
                        fontSize: 11,
                        fontFamily: 'Quicksand-Bold',
                        color: '#94A3B8',
                        letterSpacing: 1.1,
                        textTransform: 'uppercase',
                        marginBottom: 6,
                    }}
                >
                    {t('contact.hospitalAddressTitle')}
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        fontFamily: 'Quicksand-Medium',
                        color: '#334155',
                        lineHeight: 21,
                    }}
                >
                    {hospitalConfig.hospital.address}
                </Text>
            </View>
        </View>
    );
};
