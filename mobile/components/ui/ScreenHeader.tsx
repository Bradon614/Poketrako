import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { layout, spacing } from '@/theme/tokens';
import { Heading, AppText } from './Text';
import { IconButton } from './IconButton';

/**
 * ScreenHeader — the shared page title block.
 *
 * Gives every screen the same rhythm: an optional back affordance, an optional
 * uppercase eyebrow, the title, an optional subtitle and right-aligned actions.
 * Used by all six tab screens plus the detail/create screens, which is what
 * makes the app feel like one product rather than nine pages.
 */

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  /** Right-aligned actions (buttons, icon buttons). */
  actions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  onBack,
  actions,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {onBack && (
        <IconButton
          name="chevron-back"
          onPress={onBack}
          size="md"
          variant="glass"
          accessibilityLabel="Retour"
          style={styles.back}
        />
      )}
      <View style={styles.titles}>
        {eyebrow && (
          <AppText variant="label" tone="muted" uppercase style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        )}
        <Heading level={2} numberOfLines={1}>
          {title}
        </Heading>
        {subtitle && (
          <AppText variant="bodySmall" tone="secondary" numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: layout.sectionGap - spacing.sm,
  },
  back: {
    marginRight: spacing.sm,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginTop: spacing.xxs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    marginLeft: spacing.sm,
  },
});
