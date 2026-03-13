import { Dimensions } from 'react-native';

export const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export const CARD_CONFIG = {
    width: screenWidth - 30,
    margin: 8,
    height: screenHeight || 0,
};
