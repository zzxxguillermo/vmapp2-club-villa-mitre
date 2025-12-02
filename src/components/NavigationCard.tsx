import React from 'react';
import { TouchableOpacity, ImageBackground, View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { COLORS } from '../constants/colors';

interface NavigationCardProps {
  title: string;
  imageSource: any;
  onPress: () => void;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({ title, imageSource, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <ImageBackground source={imageSource} style={styles.card} imageStyle={styles.cardImage}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Typography variant="h2" style={styles.title}>
            {title}
          </Typography>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.SHADOW_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    height: 160,
    justifyContent: 'flex-end',
  },
  cardImage: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
