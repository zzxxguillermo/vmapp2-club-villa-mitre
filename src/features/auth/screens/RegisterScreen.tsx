import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { COLORS } from '../../../constants/colors';
import { theme } from '../../../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, RegisterSchema } from '../../../schemas/authSchemas';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Refs para navegación entre campos
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
    },
    mode: 'onBlur',
  });

  const passwordValue = watch('password') || '';

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = async (data: RegisterSchema) => {
    try {
      console.log('🚀 REGISTRO: Iniciando registro con datos:', data);
      await register(data);

      console.log('✅ REGISTRO: Registro exitoso');
      Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            console.log('🏠 REGISTRO: Navegando a Home screen');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error: any) {
      console.error('💥 REGISTRO: Error en el proceso de registro:', error);

      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        'No se pudo crear la cuenta. Intenta nuevamente.';

      Alert.alert('Error de Registro', errorMessage);
    }
  };

  const renderInput = (
    name: keyof RegisterSchema,
    placeholder: string,
    icon: string,
    options?: {
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      maxLength?: number;
      showToggle?: boolean;
      showState?: boolean;
      onToggle?: () => void;
      ref?: React.RefObject<TextInput | null>;
      returnKeyType?: 'next' | 'done' | 'go';
      onSubmitEditing?: () => void;
    }
  ) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          const hasError = !!errors[name];
          const isFocused = focusedField === name;
          const hasValue = !!value;

          return (
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  hasError && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name={icon as any}
                  size={18}
                  color={hasError ? COLORS.ERROR : isFocused ? COLORS.PRIMARY_GREEN : COLORS.GRAY_MEDIUM}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={options?.ref}
                  style={[styles.input, hasValue && styles.inputWithValue]}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.GRAY_MEDIUM}
                  value={value}
                  onChangeText={onChange}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  onFocus={() => setFocusedField(name)}
                  secureTextEntry={options?.secureTextEntry && !options?.showState}
                  keyboardType={options?.keyboardType || 'default'}
                  maxLength={options?.maxLength}
                  editable={!loading}
                  selectTextOnFocus={true}
                  showSoftInputOnFocus={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  blurOnSubmit={options?.returnKeyType === 'done'}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  spellCheck={false}
                  keyboardAppearance="light"
                  returnKeyType={options?.returnKeyType || 'next'}
                  onSubmitEditing={options?.onSubmitEditing}
                  enablesReturnKeyAutomatically={true}
                />
                {options?.showToggle && (
                  <TouchableOpacity onPress={options.onToggle} style={styles.toggleButton}>
                    <Ionicons
                      name={options.showState ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={COLORS.GRAY_MEDIUM}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {hasError && (
                <Animated.View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={14} color={COLORS.ERROR} />
                  <Text style={styles.errorText}>{errors[name]?.message}</Text>
                </Animated.View>
              )}
            </View>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Onboarding')}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.title}>Crear Cuenta</Text>
                <Text style={styles.subtitle}>
                  Únete al Club Villa Mitre y disfruta de todos los beneficios
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {renderInput('dni', 'DNI (sin puntos)', 'card-outline', {
                  keyboardType: 'numeric',
                  maxLength: 8,
                  returnKeyType: 'next',
                  onSubmitEditing: () => nameRef.current?.focus(),
                })}

                {renderInput('name', 'Nombre completo', 'person-outline', {
                  keyboardType: 'default',
                  ref: nameRef,
                  returnKeyType: 'next',
                  onSubmitEditing: () => emailRef.current?.focus(),
                })}

                {renderInput('email', 'Email', 'mail-outline', {
                  keyboardType: 'email-address',
                  ref: emailRef,
                  returnKeyType: 'next',
                  onSubmitEditing: () => phoneRef.current?.focus(),
                })}

                {renderInput('phone', 'Teléfono (opcional)', 'call-outline', {
                  keyboardType: 'phone-pad',
                  ref: phoneRef,
                  returnKeyType: 'next',
                  onSubmitEditing: () => passwordRef.current?.focus(),
                })}

                {renderInput('password', 'Contraseña', 'lock-closed-outline', {
                  secureTextEntry: true,
                  showToggle: true,
                  showState: showPassword,
                  onToggle: () => setShowPassword(!showPassword),
                  ref: passwordRef,
                  returnKeyType: 'next',
                  onSubmitEditing: () => confirmPasswordRef.current?.focus(),
                })}

                {/* Password Requirements - Always Visible */}
                <View style={styles.passwordRequirements}>
                  <View style={styles.requirementsHeader}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={COLORS.PRIMARY_GREEN}
                    />
                    <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
                  </View>

                  <View style={styles.requirementsList}>
                    <View style={styles.requirementItem}>
                      <Ionicons
                        name={
                          passwordValue.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={18}
                        color={
                          passwordValue.length >= 8 ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
                        }
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          passwordValue.length >= 8 && styles.requirementValid,
                        ]}
                      >
                        Mínimo 8 caracteres
                      </Text>
                    </View>

                    <View style={styles.requirementItem}>
                      <Ionicons
                        name={
                          /[A-Z]/.test(passwordValue) ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={18}
                        color={
                          /[A-Z]/.test(passwordValue) ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
                        }
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          /[A-Z]/.test(passwordValue) && styles.requirementValid,
                        ]}
                      >
                        Una letra mayúscula (A-Z)
                      </Text>
                    </View>

                    <View style={styles.requirementItem}>
                      <Ionicons
                        name={
                          /[a-z]/.test(passwordValue) ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={18}
                        color={
                          /[a-z]/.test(passwordValue) ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
                        }
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          /[a-z]/.test(passwordValue) && styles.requirementValid,
                        ]}
                      >
                        Una letra minúscula (a-z)
                      </Text>
                    </View>

                    <View style={styles.requirementItem}>
                      <Ionicons
                        name={
                          /[0-9]/.test(passwordValue) ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={18}
                        color={
                          /[0-9]/.test(passwordValue) ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY
                        }
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          /[0-9]/.test(passwordValue) && styles.requirementValid,
                        ]}
                      >
                        Un número (0-9)
                      </Text>
                    </View>
                  </View>
                </View>

                {renderInput(
                  'password_confirmation',
                  'Confirmar contraseña',
                  'lock-closed-outline',
                  {
                    secureTextEntry: true,
                    showToggle: true,
                    showState: showConfirmPassword,
                    onToggle: () => setShowConfirmPassword(!showConfirmPassword),
                    ref: confirmPasswordRef,
                    returnKeyType: 'done',
                    onSubmitEditing: handleSubmit(onSubmit),
                  }
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.submitButtonText}>Crear Cuenta</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLinkButton}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: theme.container,
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_LIGHTER,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 14,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 18,
    height: 58,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: COLORS.PRIMARY_GREEN,
    borderWidth: 2,
    shadowColor: COLORS.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: COLORS.ERROR,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  inputWithValue: {
    fontWeight: '500',
  },
  toggleButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.ERROR,
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY_GREEN,
    borderRadius: 16,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: COLORS.PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  loginLinkText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  loginLinkButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY_GREEN,
  },
  passwordRequirements: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_GREEN + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 4,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  requirementValid: {
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
});
