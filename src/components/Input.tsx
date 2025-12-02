import React, { useState, forwardRef } from 'react';
import { TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/colors';
import { theme } from '../styles/theme';

interface InputProps extends TextInputProps {
  variant?: 'default' | 'rounded';
  size?: 'medium' | 'large';
  fontFamily?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ variant = 'rounded', size = 'large', style, onFocus, onBlur, fontFamily, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const getInputStyle = (): TextStyle => {
      const baseStyle = {
        ...theme.input,
        borderRadius: variant === 'rounded' ? 25 : 8,
        paddingVertical: size === 'large' ? 16 : 12,
        fontSize: size === 'large' ? 16 : 14,
        ...(isFocused && theme.inputFocused),
        ...(fontFamily && { fontFamily }),
      };

      return baseStyle;
    };

    return (
      <TextInput
        ref={ref}
        style={[getInputStyle(), style]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={COLORS.GRAY_MEDIUM}
        editable={true}
        selectTextOnFocus={true}
        showSoftInputOnFocus={true}
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
        spellCheck={false}
        autoCorrect={false}
        keyboardAppearance="light"
        returnKeyType="done"
        enablesReturnKeyAutomatically={true}
        {...props}
      />
    );
  }
);
