import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance';

interface CategoryBadgeProps {
  category: ExerciseCategory;
  showIcon?: boolean;
  variant?: 'filled' | 'outlined';
}

const CATEGORY_CONFIG = {
  strength: {
    label: 'Fuerza',
    color: COLORS.PRIMARY_GREEN,
    icon: 'barbell-outline' as const,
  },
  cardio: {
    label: 'Cardio',
    color: '#E91E63',
    icon: 'heart-outline' as const,
  },
  flexibility: {
    label: 'Flexibilidad',
    color: '#9C27B0',
    icon: 'body-outline' as const,
  },
  balance: {
    label: 'Balance',
    color: '#2196F3',
    icon: 'fitness-outline' as const,
  },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  variant = 'filled',
}) => {
  const config = CATEGORY_CONFIG[category];
  
  const isFilled = variant === 'filled';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isFilled ? `${config.color}20` : 'transparent',
          borderColor: config.color,
          borderWidth: isFilled ? 1 : 1.5,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={14}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontWeight: isFilled ? '600' : '700',
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default CategoryBadge;
