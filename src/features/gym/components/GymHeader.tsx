import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';

interface GymHeaderProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
}

export const GymHeader: React.FC<GymHeaderProps> = ({
  title,
  subtitle,
  imageUrl = 'https://picsum.photos/id/1841/800/400',
}) => {
  return (
    <View style={styles.headerSection}>
      <Image source={{ uri: imageUrl }} style={styles.headerImage} resizeMode="cover" />
      <View style={styles.headerOverlay}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    position: 'relative',
    height: 200,
    marginBottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    fontFamily: 'BarlowCondensed-Bold',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginTop: 4,
    opacity: 0.9,
  },
});
