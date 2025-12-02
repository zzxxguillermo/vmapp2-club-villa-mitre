// components/SocialLoginButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

const PROVIDER_CONFIG = {
  google: {
    backgroundColor: '#FAFBFF',
    textColor: '#1F1F1F',
    borderColor: '#E8F0FE',
    iconName: 'logo-google' as const,
    iconColor: '#4285F4',
    text: 'Continuar con Google',
  },
  facebook: {
    backgroundColor: '#F8FBFF',
    textColor: '#1F1F1F',
    borderColor: '#E7F3FF',
    iconName: 'logo-facebook' as const,
    iconColor: '#1877F2',
    text: 'Continuar con Facebook',
  },
};

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const config = PROVIDER_CONFIG[provider];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.PRIMARY_GREEN} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Ionicons name={config.iconName} size={22} color={config.iconColor} />
          </View>
          <Text style={[styles.text, { color: config.textColor }]}>{config.text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Container for social login buttons
export const SocialLoginContainer: React.FC<{
  onGooglePress: () => void;
  onFacebookPress: () => void;
  loading?: boolean;
  style?: any;
}> = ({ onGooglePress, onFacebookPress, loading = false, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o continúa con</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsContainer}>
        <SocialLoginButton
          provider="google"
          onPress={onGooglePress}
          loading={loading}
          style={styles.socialButton}
        />

        <SocialLoginButton
          provider="facebook"
          onPress={onFacebookPress}
          loading={loading}
          style={styles.socialButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  container: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 12,
  },
  socialButton: {
    width: '100%',
  },
});
