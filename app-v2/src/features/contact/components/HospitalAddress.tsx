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
                borderTopWidth: 1,
                borderTopColor: '#EEF2F7',
                paddingTop: 20,
                marginTop: 4,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Ionicons
                    name="navigate-outline"
                    size={18}
                    color="#94A3B8"
                    style={{ marginTop: 2, marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
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
                            fontSize: 15,
                            fontFamily: 'Quicksand-Medium',
                            color: '#334155',
                            lineHeight: 22,
                        }}
                    >
                        {hospitalConfig.hospital.address}
                    </Text>
                </View>
            </View>
        </View>
    );
};
