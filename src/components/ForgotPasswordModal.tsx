import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from './Logo';
import { Typography } from './Typography';
import { Button } from './Button';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Botón cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo backgroundColor="dark" size="large" />
          </View>

          {/* Título */}
          <Typography
            variant="h2"
            style={styles.title}
            fontFamily="BarlowCondensed-Bold"
          >
            ¿Olvidó su contraseña?
          </Typography>

          {/* Mensaje */}
          <View style={styles.messageContainer}>
            <View style={styles.iconRow}>
              <Ionicons
                name="information-circle"
                size={24}
                color={COLORS.PRIMARY_GREEN}
              />
              <Typography
                variant="body"
                style={styles.message}
                fontFamily="BarlowCondensed-Regular"
              >
                Para recuperar su contraseña, por favor contacte con el
                administrador del club.
              </Typography>
            </View>

            {/* Información de contacto */}
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color={COLORS.PRIMARY_GREEN} />
                <Typography style={styles.contactText}>
                  villamitre@surtekbb.com
                </Typography>
              </View>
            </View>
          </View>

          {/* Botón */}
          <Button
            title="ENTENDIDO"
            onPress={onClose}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.PRIMARY_BLACK,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 28,
  },
  messageContainer: {
    width: '100%',
    marginBottom: 25,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  message: {
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    marginLeft: 10,
  },
  contactInfo: {
    width: '100%',
    backgroundColor: COLORS.GRAY_LIGHTEST,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_GREEN,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  contactText: {
    color: COLORS.PRIMARY_BLACK,
    fontSize: 15,
    marginLeft: 10,
    fontFamily: 'BarlowCondensed-Medium',
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
  },
});
