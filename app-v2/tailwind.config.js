/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                dark: {
                    100: '#1a1a2e',
                    200: '#16213e',
                    300: '#0f3460',
                },
            },
            fontFamily: {
                'quicksand-light': ['Quicksand-Light'],
                'quicksand': ['Quicksand-Regular'],
                'quicksand-medium': ['Quicksand-Medium'],
                'quicksand-semibold': ['Quicksand-SemiBold'],
                'quicksand-bold': ['Quicksand-Bold'],
            },
        },
    },
    plugins: [],
};
