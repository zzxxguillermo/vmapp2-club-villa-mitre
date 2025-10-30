import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: 'Principiante',
    color: '#4CAF50',
    icon: 'leaf-outline' as const,
  },
  intermediate: {
    label: 'Intermedio',
    color: '#FF9800',
    icon: 'flame-outline' as const,
  },
  advanced: {
    label: 'Avanzado',
    color: '#F44336',
    icon: 'flash-outline' as const,
  },
};

const SIZE_CONFIG = {
  small: { fontSize: 11, padding: 4, iconSize: 12 },
  medium: { fontSize: 13, padding: 6, iconSize: 14 },
  large: { fontSize: 15, padding: 8, iconSize: 16 },
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  level,
  size = 'medium',
  showIcon = true,
}) => {
  const config = DIFFICULTY_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${config.color}20`,
          borderColor: config.color,
          paddingVertical: sizeConfig.padding,
          paddingHorizontal: sizeConfig.padding * 1.5,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={sizeConfig.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: sizeConfig.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default DifficultyBadge;
