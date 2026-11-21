import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '@/theme/tokens';
import { AppText } from './Text';
import { PressableScale } from './PressableScale';

/**
 * SectionHeader — the small title that introduces a group of content, with an
 * optional inline action ("Tout voir"). Keeps section titles identical in
 * weight and spacing on every screen.
 */

interface SectionHeaderProps {
  title: string;
  caption?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  caption,
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titles}>
        <AppText variant="label" tone="secondary" uppercase>
          {title}
        </AppText>
        {caption && (
          <AppText variant="captionSmall" tone="muted" style={styles.caption}>
            {caption}
          </AppText>
        )}
      </View>
      {actionLabel && onActionPress && (
        <PressableScale onPress={onActionPress} hitSlop={8} accessibilityLabel={actionLabel}>
          <AppText variant="bodySmall" tone="accent">
            {actionLabel}
          </AppText>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 2,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  caption: {
    marginTop: 2,
  },
});
