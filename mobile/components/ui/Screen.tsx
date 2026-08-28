import React from 'react';
import { View, StyleSheet, ViewStyle, SafeAreaView } from 'react-native';
import { colors, spacing } from './design';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeArea = true,
  backgroundColor = colors.background,
}) => {
  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});