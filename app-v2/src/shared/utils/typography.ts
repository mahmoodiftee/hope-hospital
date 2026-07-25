import { Platform } from 'react-native';
import i18next from 'i18next';

/**
 * Standard utility to handle Typography weight "step-down" for Bengali.
 * Because Bengali characters are more dense/complex, standard bold/semibold
 * often looks too thick. This utility returns a lighter variant when in Bengali mode.
 */

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black';

const WEIGHT_MAP: Record<FontWeight, string> = {
    'light': 'Quicksand-Light',
    'regular': 'Quicksand-Regular',
    'medium': 'Quicksand-Medium',
    'semibold': 'Quicksand-SemiBold',
    'bold': 'Quicksand-Bold',
    'black': 'Quicksand-Bold',
};

// Refined Bengali "Step-Down" map (more aggressive)
const BN_WEIGHT_MAP: Record<FontWeight, FontWeight> = {
    'light': 'light',
    'regular': 'light',
    'medium': 'regular',
    'semibold': 'regular', // More aggressive: SemiBold -> Regular
    'bold': 'regular',     // More aggressive: Bold -> Regular
    'black': 'medium',
};

// Scaling factor for Bengali to match perceived Latin size
const BN_SIZE_SCALE = 0.9;

export const getFontFamily = (weight: FontWeight = 'regular'): string => {
    const isBengali = i18next.language === 'bn';
    let resolvedWeight = weight;

    if (isBengali) {
        resolvedWeight = BN_WEIGHT_MAP[weight];
    }

    return WEIGHT_MAP[resolvedWeight];
};

/**
 * Helper to get weight-adjusted style object with optional size scaling
 */
export const getTypographyStyle = (weight: FontWeight = 'regular', baseSize?: number) => {
    const isBengali = i18next.language === 'bn';

    const style: any = {
        fontFamily: getFontFamily(weight),
        fontWeight: Platform.OS === 'ios' ? undefined : ('normal' as const),
    };

    if (isBengali && baseSize) {
        style.fontSize = Math.round(baseSize * BN_SIZE_SCALE);
    } else if (baseSize) {
        style.fontSize = baseSize;
    }

    return style;
};
