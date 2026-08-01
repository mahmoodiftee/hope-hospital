import { hospitalConfig } from '@/config/hospitalConfig';
import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ScheduleRowProps {
    label: string;
    value: string;
    accent?: string;
}

const ScheduleRow: React.FC<ScheduleRowProps> = ({ label, value, accent = '#0F172A' }) => (
    <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingVertical: 12,
        }}
    >
        <Text
            style={{
                flex: 1,
                fontSize: 14,
                fontFamily: 'Quicksand-SemiBold',
                color: '#64748B',
                paddingRight: 12,
            }}
        >
            {label}
        </Text>
        <Text
            style={{
                flex: 1,
                fontSize: 14,
                fontFamily: 'Quicksand-Bold',
                color: accent,
                textAlign: 'right',
            }}
        >
            {value}
        </Text>
    </View>
);

export const OperatingHours: React.FC = () => {
    const { t } = useTranslation();

    return (
        <View style={{ marginBottom: 8 }}>
            <Text
                style={{
                    fontSize: 11,
                    fontFamily: 'Quicksand-Bold',
                    color: '#94A3B8',
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                }}
            >
                {t('contact.operatingHoursTitle')}
            </Text>

            <View
                style={{
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: '#EEF2F7',
                }}
            >
                <ScheduleRow
                    label={t('contact.emergency247Title')}
                    value={hospitalConfig.hours.emergency}
                    accent="#DC2626"
                />
                <View style={{ height: 1, backgroundColor: '#EEF2F7' }} />
                <ScheduleRow
                    label={t('contact.opdTitle')}
                    value={hospitalConfig.hours.opd}
                />
            </View>
        </View>
    );
};
