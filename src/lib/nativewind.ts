// NativeWind v4 uses className prop directly on React Native components
// This file exports utility components with TypeScript support for className

import { ComponentProps } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';

// Define types with className support
type WithClassName<T> = T & { className?: string };

// Export typed components
export type StyledViewProps = WithClassName<ComponentProps<typeof View>>;
export type StyledTextProps = WithClassName<ComponentProps<typeof Text>>;
export type StyledTextInputProps = WithClassName<ComponentProps<typeof TextInput>>;
export type StyledTouchableOpacityProps = WithClassName<ComponentProps<typeof TouchableOpacity>>;
export type StyledPressableProps = WithClassName<ComponentProps<typeof Pressable>>;
export type StyledScrollViewProps = WithClassName<ComponentProps<typeof ScrollView>>;
export type StyledImageProps = WithClassName<ComponentProps<typeof Image>>;

// Re-export React Native components (they'll accept className prop with NativeWind)
export { Text, View, TextInput, TouchableOpacity, ScrollView, Image, Pressable };
