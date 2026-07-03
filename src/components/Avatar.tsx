// src/components/Avatar.tsx — User initials avatar with optional image
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight } from '../constants/theme';

interface Props {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const BG_COLORS = [
  '#F97316', '#3B82F6', '#22C55E', '#8B5CF6',
  '#EF4444', '#F59E0B', '#14B8A6', '#EC4899',
];

function pickColor(name: string): string {
  const idx = name.charCodeAt(0) % BG_COLORS.length;
  return BG_COLORS[idx];
}

export const Avatar: React.FC<Props> = ({
  name,
  size = 40,
  backgroundColor,
  textColor = Colors.white,
}) => {
  const bg = backgroundColor ?? pickColor(name);
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38, color: textColor }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FontWeight.bold,
  },
});
