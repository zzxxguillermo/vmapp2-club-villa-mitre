import '@testing-library/jest-native/extend-expect';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return {
        Ionicons: View,
        MaterialIcons: View,
        FontAwesome: View,
    };
});

// Mock expo-font
jest.mock('expo-font', () => ({
    isLoaded: jest.fn().mockReturnValue(true),
    loadAsync: jest.fn().mockResolvedValue(true),
    useFonts: jest.fn().mockReturnValue([true, null]),
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: {},
    EventEmitter: jest.fn(),
    requireOptionalNativeModule: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        manifest: {
            extra: {
                API_URL: 'http://localhost:3000',
            },
        },
        expoConfig: {
            extra: {
                API_URL: 'http://localhost:3000',
            },
        },
    },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
        Swipeable: View,
        DrawerLayoutAndroid: View,
        State: {},
        ScrollView: View,
        Slider: View,
        Switch: View,
        TextInput: View,
        ToolbarAndroid: View,
        ViewPagerAndroid: View,
        WebView: View,
        NativeViewGestureHandler: View,
        TapGestureHandler: View,
        FlingGestureHandler: View,
        ForceTouchGestureHandler: View,
        LongPressGestureHandler: View,
        PanGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        /* Buttons */
        RawButton: View,
        BaseButton: View,
        RectButton: View,
        BorderlessButton: View,
        /* Other */
        FlatList: View,
        gestureHandlerRootHOC: jest.fn(),
        Directions: {},
    };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock expo-image
jest.mock('expo-image', () => {
    const { View } = require('react-native');
    return {
        Image: View,
    };
});


